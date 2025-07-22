// Cronjob dọn dẹp giao dịch đại lý hàng tháng
import cron from 'node-cron';
import AgentTransaction from '../models/agentTransaction.model';

// Cronjob dọn dẹp các giao dịch đại lý đã hết hạn hoặc thất bại
export const startMonthlyAgentTransactionCleanup = () => {
  // Chạy vào 7h sáng ngày 1 hàng tháng
  cron.schedule('0 7 1 * *', async () => {
    const result = await AgentTransaction.deleteMany({});
    console.log(`Deleted ${result.deletedCount} agent transactions (all) at 7am on the 1st of the month.`);
  });
};
