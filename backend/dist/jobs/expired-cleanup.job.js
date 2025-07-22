"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startExpiredCleanupJob = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const account_model_1 = __importDefault(require("../models/account.model"));
const startExpiredCleanupJob = (io) => {
    // Chạy tác vụ mỗi 3 phút (tránh conflict với pending-cleanup)
    node_cron_1.default.schedule('*/3 * * * *', async () => {
        console.log('Running expired accounts cleanup job...');
        const now = new Date();
        try {
            // Cách 1: Bulk update KHÔNG dùng session - tránh write conflict
            const result = await account_model_1.default.updateMany({
                status: 'rented',
                expiresAt: { $lt: now }
            }, { $set: { status: 'waiting' } });
            if (result.modifiedCount > 0) {
                console.log(`Updated ${result.modifiedCount} expired accounts to 'waiting' status.`);
                // Lấy danh sách accounts đã update để emit socket
                const updatedAccounts = await account_model_1.default.find({
                    status: 'waiting',
                    expiresAt: { $lt: now }
                }).select('_id');
                // Gửi tín hiệu đến tất cả các client để cập nhật giao diện
                for (const account of updatedAccounts) {
                    io.emit('account_updated', { accountId: account._id, newStatus: 'waiting' });
                }
            }
        }
        catch (error) {
            console.error('Error in expired cleanup job:', error);
        }
    });
};
exports.startExpiredCleanupJob = startExpiredCleanupJob;
