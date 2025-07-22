"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminStatistics = void 0;
const setting_model_1 = __importDefault(require("../../models/setting.model"));
const voucher_model_1 = __importDefault(require("../../models/voucher.model"));
const getAdminStatistics = async (req, res, next) => {
    try {
        // Lấy doanh thu tháng
        const setting = await setting_model_1.default.findOne();
        const monthlyRevenue = setting?.monthlyRevenue || 0;
        // Lấy tổng số voucher đã tạo và đã sử dụng (trong ngày)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const totalVouchers = await voucher_model_1.default.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } });
        const usedVouchers = await voucher_model_1.default.countDocuments({ isUsed: true, createdAt: { $gte: today, $lt: tomorrow } });
        res.status(200).json({
            success: true,
            data: {
                monthlyRevenue,
                totalVouchers,
                usedVouchers
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAdminStatistics = getAdminStatistics;
