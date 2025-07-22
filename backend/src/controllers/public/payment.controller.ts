// File: src/controllers/public/payment.controller.ts
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { generateNewVoucher } from '../../services/voucher.service';
// import { handleOrderCancellation } from '../../services/cancellation-handler.service'; // ĐÃ XÓA
import Account from '../../models/account.model';
import Setting from '../../models/setting.model';
import Transaction from '../../models/transaction.model';
import Voucher from '../../models/voucher.model';
import ApiError from '../../utils/apiError';
import config from '../../config/env';
import payOS from '../../utils/payos';

import { orderRateLimitMiddleware } from '../../middlewares/orderRateLimit.middleware'; // ⭐ THÊM DÒNG NÀY


export const createPaymentLinkController = async (req: Request, res: Response, next: NextFunction) => {
    let rateLimited = false;
    await new Promise<void>(resolve => {
        orderRateLimitMiddleware(req, res, (err?: any) => {
            if (err || res.headersSent) rateLimited = true;
            resolve();
        });
    });
    if (rateLimited) return;

    const { rentalPackageKey, voucherCode, socketId } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const settings = await Setting.findOne().session(session);
        if (!settings) throw new ApiError(500, 'Không tìm thấy cài đặt hệ thống.');

        const rentalPackage = settings.rentalPrices.get(rentalPackageKey);
        if (!rentalPackage) throw new ApiError(400, 'Gói thuê không hợp lệ.');

        let finalAmount = rentalPackage.price;
        let discountAmount = 0;
        if (voucherCode) {
            const voucher = await Voucher.findOne({ code: voucherCode, isUsed: false, expiresAt: { $gte: new Date() } }).session(session);
            if (voucher) {
                finalAmount -= voucher.discountAmount;
                discountAmount = voucher.discountAmount;
            } else {
                throw new ApiError(400, 'Mã giảm giá không hợp lệ, đã hết hạn hoặc đã được sử dụng.');
            }
        }
        finalAmount = Math.max(finalAmount, 0);

        // ✅ SỬA: Dùng 6 số cuối timestamp + 4 ký tự random
        const timeString = Date.now().toString().slice(-6); // 6 số cuối timestamp
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let randomSuffix = '';
        for (let i = 0; i < 4; i++) {
            randomSuffix += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        const description = `TLM${timeString}${randomSuffix}`;
        
        // ✅ BỎ COUNTER - Không cập nhật settings nữa
        // settings.paymentDescriptionCounter = (settings.paymentDescriptionCounter % 999) + 1;
        // await settings.save({ session });

        const orderCode = Number(`${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);

        const newTransaction = new Transaction({
            orderCode,
            rentalPackageKey,
            amount: rentalPackage.price,
            discountAmount,
            finalAmount,
            status: 'CREATED', // Changed from 'PENDING' to 'CREATED'
            voucherCode,
            socketId,
            rentalDurationInMinutes: rentalPackage.duration * 60,
        });
        await newTransaction.save({ session });

        const expiredAt = Math.floor((Date.now() / 1000) + 5 * 60);

        const paymentData = {
            orderCode,
            amount: finalAmount,
            description,
            returnUrl: `${config.frontendUrl}/thanh-cong/${orderCode}`,
            cancelUrl: `${config.frontendUrl}/don-huy/${orderCode}`,
            expiredAt,
        };

        const paymentLink = await payOS.createPaymentLink(paymentData);

        await session.commitTransaction();
        res.status(200).json({ success: true, data: paymentLink });

    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};

export const handlePayOSWebhook = async (req: Request, res: Response, next: NextFunction) => {
    console.log('Webhook received...');
    const webhookBody = req.body;

    try {
        let parsedBody: any;
        try {
            parsedBody = JSON.parse(webhookBody.toString());
        } catch (error) {
            return next(new ApiError(400, 'Invalid JSON body.'));
        }

        if (!parsedBody.data || Object.keys(parsedBody.data).length === 0) {
            return res.status(200).json({ success: true, message: 'Webhook URL verified' });
        }

        const webhookCode = parsedBody.code;

        // Chỉ xử lý webhook thành công
        if (webhookCode === '00') {
            console.log('SUCCESS webhook received. Verifying signature...');
            const verifiedData = await payOS.verifyPaymentWebhookData(parsedBody);
            const { orderCode } = verifiedData;
            console.log(`Processing payment for orderCode: ${orderCode}`);
            const session = await mongoose.startSession();
            session.startTransaction();
            try {
                const transaction = await Transaction.findOne({ orderCode, status: 'CREATED' }).session(session);
                if (!transaction) {
                    await session.abortTransaction();
                    return res.status(200).json({ success: true, message: 'Transaction for PAID webhook not found' });
                }

                // Tìm account available đầu tiên (theo displayOrder) với retry mechanism
                const rentedAt = new Date();
                const expiresAt = new Date(rentedAt.getTime() + transaction.rentalDurationInMinutes * 60 * 1000);
                
                let account = null;
                let retryCount = 0;
                const maxRetries = 3;
                
                while (retryCount < maxRetries && !account) {
                    try {
                        account = await Account.findOneAndUpdate(
                            { status: 'available' },
                            { status: 'rented', rentedAt, expiresAt, currentTransactionId: null },
                            { session, new: true, sort: { displayOrder: 1 } }
                        );
                        break;
                    } catch (error: any) {
                        if (error.message.includes('Write conflict') && retryCount < maxRetries - 1) {
                            console.log(`Write conflict on account update, retrying... (${retryCount + 1}/${maxRetries}) for orderCode: ${orderCode}`);
                            retryCount++;
                            // Đợi ngẫu nhiên 100-500ms trước khi retry
                            await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 400));
                        } else {
                            throw error;
                        }
                    }
                }
                
                if (!account) {
                    console.log(`No available account found after ${maxRetries} retries for orderCode: ${orderCode}`);
                    transaction.status = 'FAILED';
                    await transaction.save({ session });
                    await session.commitTransaction();
                    return res.status(200).json({ success: false, message: 'Liên hệ Zalo để được hỗ trợ.' });
                }

                // Cập nhật transaction trước khi làm các việc khác
                transaction.accountId = account._id as mongoose.Types.ObjectId;
                transaction.status = 'PAID';
                console.log(`Successfully assigned account ${account.username} to orderCode: ${orderCode}`);
                
                try {
                    // Lưu transaction trước
                    await transaction.save({ session });
                    
                    // Xử lý voucher nếu có
                    if (transaction.voucherCode) {
                        await Voucher.updateOne({ code: transaction.voucherCode }, { isUsed: true }).session(session);
                    }
                    
                    // Generate voucher mới (không cần await trong session)
                    const createdVoucher = await generateNewVoucher() as { _id: mongoose.Types.ObjectId };
                    transaction.newVoucherId = createdVoucher._id;
                    await transaction.save({ session });

                    // Cập nhật doanh thu tháng
                    const setting = await Setting.findOne().session(session);
                    if (setting) {
                        setting.monthlyRevenue = (setting.monthlyRevenue || 0) + transaction.finalAmount;
                        await setting.save({ session });
                    }

                    // Commit transaction trước khi emit
                    await session.commitTransaction();
                    
                    // Emit sau khi commit thành công
                    req.io.emit('account_updated', { accountId: account._id, newStatus: 'rented', expiresAt: account.expiresAt });
                    
                } catch (saveError) {
                    console.error(`Error saving transaction data for orderCode ${orderCode}:`, saveError);
                    // Rollback account status nếu save transaction thất bại
                    try {
                        await Account.findByIdAndUpdate(account._id, { status: 'available', rentedAt: null, expiresAt: null });
                    } catch (rollbackError) {
                        console.error(`Failed to rollback account ${account.username}:`, rollbackError);
                    }
                    throw saveError;
                }

                // Hẹn giờ tự động đổi trạng thái khi hết hạn
                const rentalDurationInMs = transaction.rentalDurationInMinutes * 60 * 1000;
                setTimeout(async () => {
                    try {
                        const accountToExpire = await Account.findById(account._id);
                        if (accountToExpire && accountToExpire.status === 'rented') {
                            accountToExpire.status = 'waiting';
                            await accountToExpire.save();
                            req.io.emit('account_updated', { accountId: accountToExpire._id, newStatus: 'waiting' });
                            console.log(`Account ${accountToExpire.username} status changed to waiting after expiration.`);
                        }
                    } catch (err) {
                        console.error('Error in setTimeout for account expiration:', err);
                    }
                }, rentalDurationInMs);
            } catch (dbError) {
                await session.abortTransaction();
                return next(new ApiError(500, 'Database error during PAID processing.'));
            } finally {
                session.endSession();
            }
        } 
        
        // Luôn trả về 200 OK để PayOS không gửi lại webhook
        return res.status(200).json({ success: true });

    } catch (error) {
        return next(new ApiError(400, 'Webhook signature verification failed or invalid data.'));
    }
};

export const getOrderConfirmationDetails = async (req: Request, res: Response, next: NextFunction) => {
    // SỬA ĐỔI: Lấy orderCode từ params thay vì query
    const { orderCode } = req.params;
    try {
        if (!orderCode) {
            throw new ApiError(400, 'Mã đơn hàng không hợp lệ.');
        }

        // Không cần accountId nữa vì orderCode là duy nhất
        const transaction = await Transaction.findOne({ orderCode: Number(orderCode), status: 'PAID' });
        if (!transaction) throw new ApiError(404, 'Vui nhấn vào Nút Zalo hoặc FB bên dưới để nhận tài khoản.');
        const account = await Account.findById(transaction.accountId).select('+password');
        if (!account) throw new ApiError(404, 'Tài khoản không tồn tại.');
        
        const voucher = transaction.newVoucherId
          ? await Voucher.findById(transaction.newVoucherId)
          : null;
        res.status(200).json({
            success: true,
            data: {
                account: {
                username: account.username,
                password: account.password,
                expiresAt: account.expiresAt,
        },
        newVoucher: voucher ? { code: voucher.code, discountAmount: voucher.discountAmount } : null,
    },
});
    } catch (error) {
        next(error);
    }
};

// HÀM MỚI ĐỂ XỬ LÝ HỦY ĐƠN HÀNG TỪ CLIENT
export const cancelOrderByClient = async (req: Request, res: Response, next: NextFunction) => {
    const { orderCode } = req.body;
    if (!orderCode) {
        return next(new ApiError(400, 'Order code is required.'));
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const transaction = await Transaction.findOne({ orderCode: Number(orderCode), status: 'CREATED' }).session(session);

        if (!transaction) {
            await session.abortTransaction();
            // Không phải lỗi, có thể giao dịch đã được xử lý (thanh toán hoặc hết hạn)
            return res.status(200).json({ success: true, message: 'Transaction not found or already processed.' });
        }

        // Cập nhật trạng thái giao dịch
        transaction.status = 'CANCELLED';
        await transaction.save({ session });

    await session.commitTransaction();
    res.status(200).json({ success: true, message: 'Order cancelled successfully.' });

    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};