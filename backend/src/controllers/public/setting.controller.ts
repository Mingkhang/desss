import { Request, Response, NextFunction } from 'express';
import Setting from '../../models/setting.model';
import ApiError from '../../utils/apiError';

export const getPublicSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const settings = await Setting.findOne();
        if (!settings) {
            // Trả về lỗi nếu không tìm thấy cài đặt, thay vì trả về null
            return next(new ApiError(404, 'Settings not found.'));
        }
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        next(error);
    }
};