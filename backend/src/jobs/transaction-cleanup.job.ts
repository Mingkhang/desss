import cron from 'node-cron';
import Transaction from '../models/transaction.model';
import Setting from '../models/setting.model';

export const startTransactionCleanupJob = () => {
    cron.schedule('0 0 1 * *', async () => {
        console.log('Running monthly transaction cleanup job...');
        try {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            
            // Xóa tất cả transactions cũ hơn 1 tháng (bao gồm PAID và FAILED)
            const result = await Transaction.deleteMany({
                status: { $in: ['PAID', 'CANCELLED', 'EXPIRED', 'FAILED'] },
                createdAt: { $lt: oneMonthAgo }
            });
            
            console.log(`Monthly transaction cleanup job finished. Deleted ${result.deletedCount} transactions.`);
            
            // Reset doanh thu tháng về 0
            await Setting.updateOne({}, { $set: { monthlyRevenue: 0 } });
            console.log('Reset monthly revenue to 0.');
        } catch (error) {
            console.error('Error in monthly transaction cleanup job:', error);
        }
    });
};