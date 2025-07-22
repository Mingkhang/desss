import { Request, Response, NextFunction } from 'express';
import Voucher from '../../models/voucher.model';
import ApiError from '../../utils/apiError';

export const applyVoucher = async (req: Request, res: Response, next: NextFunction) => {
    const { voucherCode, currentOrderAmount } = req.body;
    if (!voucherCode || currentOrderAmount === undefined) {
        return next(new ApiError(400, 'Voucher code and order amount are required'));
    }

    try {
        const voucher = await Voucher.findOne({ code: voucherCode });
        if (!voucher) return next(new ApiError(404, 'Mã giảm giá không hợp lệ.'));
        if (voucher.isUsed) return next(new ApiError(400, 'Mã giảm giá đã được sử dụng.'));
        if (voucher.expiresAt < new Date()) return next(new ApiError(400, 'Mã giảm giá đã hết hạn.'));

        const finalAmount = currentOrderAmount - voucher.discountAmount;

        res.status(200).json({
            success: true,
            message: 'Áp dụng mã giảm giá thành công!',
            data: {
                isValid: true,
                code: voucher.code,
                discountAmount: voucher.discountAmount,
                finalAmount: finalAmount > 0 ? finalAmount : 0,
            }
        });
    } catch (error) {
        next(error);
    }
};