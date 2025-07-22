import cron from 'node-cron';
import Account from '../models/account.model';
import mongoose from 'mongoose';

export const startExpiredCleanupJob = (io: any) => {
    // Chạy tác vụ mỗi 3 phút (tránh conflict với pending-cleanup)
    cron.schedule('*/3 * * * *', async () => {
        console.log('Running expired accounts cleanup job...');
        const now = new Date();
        
        try {
            // Cách 1: Bulk update KHÔNG dùng session - tránh write conflict
            const result = await Account.updateMany(
                {
                    status: 'rented',
                    expiresAt: { $lt: now }
                },
                { $set: { status: 'waiting' } }
            );

            if (result.modifiedCount > 0) {
                console.log(`Updated ${result.modifiedCount} expired accounts to 'waiting' status.`);

                // Lấy danh sách accounts đã update để emit socket
                const updatedAccounts = await Account.find({
                    status: 'waiting',
                    expiresAt: { $lt: now }
                }).select('_id');

                // Gửi tín hiệu đến tất cả các client để cập nhật giao diện
                for (const account of updatedAccounts) {
                    io.emit('account_updated', { accountId: account._id, newStatus: 'waiting' });
                }
            }
        } catch (error) {
            console.error('Error in expired cleanup job:', error);
        }
    });
};