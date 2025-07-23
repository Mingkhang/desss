import cron from 'node-cron';
import Voucher from '../models/voucher.model';

export const startVoucherCleanupJob = () => {
    cron.schedule('0 0 * * 0', async () => { // 0h Chủ Nhật
        console.log('Running voucher cleanup job...');
        try {
            const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
            await Voucher.deleteMany({
                $or: [
                    { isUsed: true },
                    { expiresAt: { $lt: twoWeeksAgo } }
                ]
            });
            console.log('Voucher cleanup job finished.');
        } catch (error) {
            console.error('Error in voucher cleanup job:', error);
        }
    });
};