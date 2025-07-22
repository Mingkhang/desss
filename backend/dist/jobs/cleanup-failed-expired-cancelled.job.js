"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCleanupFailedExpiredCancelledJob = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const transaction_model_1 = __importDefault(require("../models/transaction.model"));
// Cron chạy mỗi 30 phút
const startCleanupFailedExpiredCancelledJob = async () => {
    node_cron_1.default.schedule('0 0 * * 0', async () => {
        console.log('Running cleanup for EXPIRED, CANCELLED and old CREATED transactions...');
        try {
            // Tính thời gian 10 phút trước
            const tenMinutesAgo = new Date();
            tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);
            // Xóa các giao dịch hết hạn, hủy (giữ lại FAILED để admin xử lý)
            const result1 = await transaction_model_1.default.deleteMany({
                status: { $in: ['EXPIRED', 'CANCELLED'] }
            });
            // Xóa các giao dịch CREATED quá 10 phút (đã hết hạn thanh toán)
            // ✅ KHÔNG XÓA PROCESSING - vì đang xử lý thành công
            const result2 = await transaction_model_1.default.deleteMany({
                status: 'CREATED', // Chỉ xóa CREATED, KHÔNG xóa PROCESSING
                createdAt: { $lt: tenMinutesAgo }
            });
            console.log(`Deleted ${result1.deletedCount} transactions (EXPIRED, CANCELLED) and ${result2.deletedCount} old CREATED transactions.`);
        }
        catch (error) {
            console.error('Error in cleanup job:', error);
        }
    });
};
exports.startCleanupFailedExpiredCancelledJob = startCleanupFailedExpiredCancelledJob;
