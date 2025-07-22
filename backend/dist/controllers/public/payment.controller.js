"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrderByClient = exports.getOrderConfirmationDetails = exports.handlePayOSWebhook = exports.createPaymentLinkController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const voucher_service_1 = require("../../services/voucher.service");
// import { handleOrderCancellation } from '../../services/cancellation-handler.service'; // ĐÃ XÓA
const account_model_1 = __importDefault(require("../../models/account.model"));
const setting_model_1 = __importDefault(require("../../models/setting.model"));
const transaction_model_1 = __importDefault(require("../../models/transaction.model"));
const voucher_model_1 = __importDefault(require("../../models/voucher.model"));
const apiError_1 = __importDefault(require("../../utils/apiError"));
const env_1 = __importDefault(require("../../config/env"));
const payos_1 = __importDefault(require("../../utils/payos"));
const orderRateLimit_middleware_1 = require("../../middlewares/orderRateLimit.middleware"); // ⭐ THÊM DÒNG NÀY
const createPaymentLinkController = async (req, res, next) => {
    let rateLimited = false;
    await new Promise(resolve => {
        (0, orderRateLimit_middleware_1.orderRateLimitMiddleware)(req, res, (err) => {
            if (err || res.headersSent)
                rateLimited = true;
            resolve();
        });
    });
    if (rateLimited)
        return;
    const { rentalPackageKey, voucherCode, socketId } = req.body;
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const settings = await setting_model_1.default.findOne().session(session);
        if (!settings)
            throw new apiError_1.default(500, 'Không tìm thấy cài đặt hệ thống.');
        const rentalPackage = settings.rentalPrices.get(rentalPackageKey);
        if (!rentalPackage)
            throw new apiError_1.default(400, 'Gói thuê không hợp lệ.');
        let finalAmount = rentalPackage.price;
        let discountAmount = 0;
        if (voucherCode) {
            const voucher = await voucher_model_1.default.findOne({ code: voucherCode, isUsed: false, expiresAt: { $gte: new Date() } }).session(session);
            if (voucher) {
                finalAmount -= voucher.discountAmount;
                discountAmount = voucher.discountAmount;
            }
            else {
                throw new apiError_1.default(400, 'Mã giảm giá không hợp lệ, đã hết hạn hoặc đã được sử dụng.');
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
        const newTransaction = new transaction_model_1.default({
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
            returnUrl: `${env_1.default.frontendUrl}/thanh-cong/${orderCode}`,
            cancelUrl: `${env_1.default.frontendUrl}/don-huy/${orderCode}`,
            expiredAt,
        };
        const paymentLink = await payos_1.default.createPaymentLink(paymentData);
        await session.commitTransaction();
        res.status(200).json({ success: true, data: paymentLink });
    }
    catch (error) {
        await session.abortTransaction();
        next(error);
    }
    finally {
        session.endSession();
    }
};
exports.createPaymentLinkController = createPaymentLinkController;
const handlePayOSWebhook = async (req, res, next) => {
    console.log('Webhook received...');
    const webhookBody = req.body;
    try {
        let parsedBody;
        try {
            parsedBody = JSON.parse(webhookBody.toString());
        }
        catch (error) {
            return next(new apiError_1.default(400, 'Invalid JSON body.'));
        }
        if (!parsedBody.data || Object.keys(parsedBody.data).length === 0) {
            return res.status(200).json({ success: true, message: 'Webhook URL verified' });
        }
        const webhookCode = parsedBody.code;
        // Chỉ xử lý webhook thành công
        if (webhookCode === '00') {
            console.log('SUCCESS webhook received. Verifying signature...');
            const verifiedData = await payos_1.default.verifyPaymentWebhookData(parsedBody);
            const { orderCode } = verifiedData;
            console.log(`Processing payment for orderCode: ${orderCode}`);
            const session = await mongoose_1.default.startSession();
            session.startTransaction();
            try {
                const transaction = await transaction_model_1.default.findOne({ orderCode, status: 'CREATED' }).session(session);
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
                        account = await account_model_1.default.findOneAndUpdate({ status: 'available' }, { status: 'rented', rentedAt, expiresAt, currentTransactionId: null }, { session, new: true, sort: { displayOrder: 1 } });
                        break;
                    }
                    catch (error) {
                        if (error.message.includes('Write conflict') && retryCount < maxRetries - 1) {
                            console.log(`Write conflict on account update, retrying... (${retryCount + 1}/${maxRetries}) for orderCode: ${orderCode}`);
                            retryCount++;
                            // Đợi ngẫu nhiên 100-500ms trước khi retry
                            await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 400));
                        }
                        else {
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
                transaction.accountId = account._id;
                transaction.status = 'PAID';
                console.log(`Successfully assigned account ${account.username} to orderCode: ${orderCode}`);
                try {
                    // Lưu transaction trước
                    await transaction.save({ session });
                    // Xử lý voucher nếu có
                    if (transaction.voucherCode) {
                        await voucher_model_1.default.updateOne({ code: transaction.voucherCode }, { isUsed: true }).session(session);
                    }
                    // Generate voucher mới (không cần await trong session)
                    const createdVoucher = await (0, voucher_service_1.generateNewVoucher)();
                    transaction.newVoucherId = createdVoucher._id;
                    await transaction.save({ session });
                    // Cập nhật doanh thu tháng
                    const setting = await setting_model_1.default.findOne().session(session);
                    if (setting) {
                        setting.monthlyRevenue = (setting.monthlyRevenue || 0) + transaction.finalAmount;
                        await setting.save({ session });
                    }
                    // Commit transaction trước khi emit
                    await session.commitTransaction();
                    // Emit sau khi commit thành công
                    req.io.emit('account_updated', { accountId: account._id, newStatus: 'rented', expiresAt: account.expiresAt });
                }
                catch (saveError) {
                    console.error(`Error saving transaction data for orderCode ${orderCode}:`, saveError);
                    // Rollback account status nếu save transaction thất bại
                    try {
                        await account_model_1.default.findByIdAndUpdate(account._id, { status: 'available', rentedAt: null, expiresAt: null });
                    }
                    catch (rollbackError) {
                        console.error(`Failed to rollback account ${account.username}:`, rollbackError);
                    }
                    throw saveError;
                }
                // Hẹn giờ tự động đổi trạng thái khi hết hạn
                const rentalDurationInMs = transaction.rentalDurationInMinutes * 60 * 1000;
                setTimeout(async () => {
                    try {
                        const accountToExpire = await account_model_1.default.findById(account._id);
                        if (accountToExpire && accountToExpire.status === 'rented') {
                            accountToExpire.status = 'waiting';
                            await accountToExpire.save();
                            req.io.emit('account_updated', { accountId: accountToExpire._id, newStatus: 'waiting' });
                            console.log(`Account ${accountToExpire.username} status changed to waiting after expiration.`);
                        }
                    }
                    catch (err) {
                        console.error('Error in setTimeout for account expiration:', err);
                    }
                }, rentalDurationInMs);
            }
            catch (dbError) {
                await session.abortTransaction();
                return next(new apiError_1.default(500, 'Database error during PAID processing.'));
            }
            finally {
                session.endSession();
            }
        }
        // Luôn trả về 200 OK để PayOS không gửi lại webhook
        return res.status(200).json({ success: true });
    }
    catch (error) {
        return next(new apiError_1.default(400, 'Webhook signature verification failed or invalid data.'));
    }
};
exports.handlePayOSWebhook = handlePayOSWebhook;
const getOrderConfirmationDetails = async (req, res, next) => {
    // SỬA ĐỔI: Lấy orderCode từ params thay vì query
    const { orderCode } = req.params;
    try {
        if (!orderCode) {
            throw new apiError_1.default(400, 'Mã đơn hàng không hợp lệ.');
        }
        // Không cần accountId nữa vì orderCode là duy nhất
        const transaction = await transaction_model_1.default.findOne({ orderCode: Number(orderCode), status: 'PAID' });
        if (!transaction)
            throw new apiError_1.default(404, 'Vui nhấn vào Nút Zalo hoặc FB bên dưới để nhận tài khoản.');
        const account = await account_model_1.default.findById(transaction.accountId).select('+password');
        if (!account)
            throw new apiError_1.default(404, 'Tài khoản không tồn tại.');
        const voucher = transaction.newVoucherId
            ? await voucher_model_1.default.findById(transaction.newVoucherId)
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
    }
    catch (error) {
        next(error);
    }
};
exports.getOrderConfirmationDetails = getOrderConfirmationDetails;
// HÀM MỚI ĐỂ XỬ LÝ HỦY ĐƠN HÀNG TỪ CLIENT
const cancelOrderByClient = async (req, res, next) => {
    const { orderCode } = req.body;
    if (!orderCode) {
        return next(new apiError_1.default(400, 'Order code is required.'));
    }
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const transaction = await transaction_model_1.default.findOne({ orderCode: Number(orderCode), status: 'CREATED' }).session(session);
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
    }
    catch (error) {
        await session.abortTransaction();
        next(error);
    }
    finally {
        session.endSession();
    }
};
exports.cancelOrderByClient = cancelOrderByClient;
