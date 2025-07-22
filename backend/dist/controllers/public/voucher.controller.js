"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyVoucher = void 0;
const voucher_model_1 = __importDefault(require("../../models/voucher.model"));
const apiError_1 = __importDefault(require("../../utils/apiError"));
const applyVoucher = async (req, res, next) => {
    const { voucherCode, currentOrderAmount } = req.body;
    if (!voucherCode || currentOrderAmount === undefined) {
        return next(new apiError_1.default(400, 'Voucher code and order amount are required'));
    }
    try {
        const voucher = await voucher_model_1.default.findOne({ code: voucherCode });
        if (!voucher)
            return next(new apiError_1.default(404, 'Mã giảm giá không hợp lệ.'));
        if (voucher.isUsed)
            return next(new apiError_1.default(400, 'Mã giảm giá đã được sử dụng.'));
        if (voucher.expiresAt < new Date())
            return next(new apiError_1.default(400, 'Mã giảm giá đã hết hạn.'));
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
    }
    catch (error) {
        next(error);
    }
};
exports.applyVoucher = applyVoucher;
