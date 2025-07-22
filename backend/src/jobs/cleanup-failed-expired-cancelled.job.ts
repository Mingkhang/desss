import cron from 'node-cron';
import Transaction from '../models/transaction.model';

// Cron chạy mỗi 30 phút
export const startCleanupFailedExpiredCancelledJob = async () => {
  cron.schedule('0 0 * * 0', async () => { // 0h Chủ Nhật
    console.log('Running cleanup for EXPIRED, CANCELLED and old CREATED transactions...');
    try {
      // Tính thời gian 10 phút trước
      const tenMinutesAgo = new Date();
      tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);
      
      // Xóa các giao dịch hết hạn, hủy (giữ lại FAILED để admin xử lý)
      const result1 = await Transaction.deleteMany({
        status: { $in: ['EXPIRED', 'CANCELLED'] }
      });
      
      // Xóa các giao dịch CREATED quá 10 phút (đã hết hạn thanh toán)
      // ✅ KHÔNG XÓA PROCESSING - vì đang xử lý thành công
      const result2 = await Transaction.deleteMany({
        status: 'CREATED', // Chỉ xóa CREATED, KHÔNG xóa PROCESSING
        createdAt: { $lt: tenMinutesAgo }
      });
      
      console.log(`Deleted ${result1.deletedCount} transactions (EXPIRED, CANCELLED) and ${result2.deletedCount} old CREATED transactions.`);
    } catch (error) {
      console.error('Error in cleanup job:', error);
    }
  });
};
