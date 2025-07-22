import { Request, Response, NextFunction } from 'express';
import Setting from '../../models/setting.model';
import Voucher from '../../models/voucher.model';

export const getAdminStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Lấy doanh thu tháng
    const setting = await Setting.findOne();
    const monthlyRevenue = setting?.monthlyRevenue || 0;

    // Lấy tổng số voucher đã tạo và đã sử dụng (trong ngày)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const totalVouchers = await Voucher.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } });
    const usedVouchers = await Voucher.countDocuments({ isUsed: true, createdAt: { $gte: today, $lt: tomorrow } });

    res.status(200).json({
      success: true,
      data: {
        monthlyRevenue,
        totalVouchers,
        usedVouchers
      }
    });
  } catch (error) {
    next(error);
  }
};
