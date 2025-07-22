import { Request, Response, NextFunction } from 'express';
import Setting from '../../models/setting.model';

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updatedSettings = await Setting.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        req.io.emit('settings_updated', updatedSettings);
        res.status(200).json({ success: true, data: updatedSettings });
    } catch (error) {
        next(error);
    }
};