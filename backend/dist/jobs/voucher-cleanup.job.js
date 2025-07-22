"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startVoucherCleanupJob = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const voucher_model_1 = __importDefault(require("../models/voucher.model"));
const startVoucherCleanupJob = () => {
    node_cron_1.default.schedule('0 0 * * 0', async () => {
        console.log('Running voucher cleanup job...');
        try {
            const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
            await voucher_model_1.default.deleteMany({
                $or: [
                    { isUsed: true },
                    { expiresAt: { $lt: twoWeeksAgo } }
                ]
            });
            console.log('Voucher cleanup job finished.');
        }
        catch (error) {
            console.error('Error in voucher cleanup job:', error);
        }
    });
};
exports.startVoucherCleanupJob = startVoucherCleanupJob;
