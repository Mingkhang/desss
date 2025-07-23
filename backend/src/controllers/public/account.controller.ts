import { Request, Response, NextFunction } from 'express';
import Account from '../../models/account.model';

export const getPublicAccounts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accounts = await Account.find().sort({ displayOrder: 1 });
        const publicAccounts = accounts.map(acc => {
            const { password, ...rest } = acc.toObject();
            return { ...rest, username: `Un******` };
        });
        res.status(200).json({ success: true, data: publicAccounts });
    } catch (error) {
        next(error);
    }
};