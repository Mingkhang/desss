"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startTransactionCleanupJob = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const transaction_model_1 = __importDefault(require("../models/transaction.model"));
const setting_model_1 = __importDefault(require("../models/setting.model"));
const startTransactionCleanupJob = () => {
    node_cron_1.default.schedule('0 0 1 * *', async () => {
        console.log('Running monthly transaction cleanup job...');
        try {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            // Xóa tất cả transactions cũ hơn 1 tháng (bao gồm PAID và FAILED)
            const result = await transaction_model_1.default.deleteMany({
                status: { $in: ['PAID', 'CANCELLED', 'EXPIRED', 'FAILED'] },
                createdAt: { $lt: oneMonthAgo }
            });
            console.log(`Monthly transaction cleanup job finished. Deleted ${result.deletedCount} transactions.`);
            // Reset doanh thu tháng về 0
            await setting_model_1.default.updateOne({}, { $set: { monthlyRevenue: 0 } });
            console.log('Reset monthly revenue to 0.');
        }
        catch (error) {
            console.error('Error in monthly transaction cleanup job:', error);
        }
    });
};
exports.startTransactionCleanupJob = startTransactionCleanupJob;
