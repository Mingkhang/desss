import { Request, Response, NextFunction } from 'express';
import Account from '../../models/account.model';
import ApiError from '../../utils/apiError';

export const createAccount = async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;
    if (!username || !password) return next(new ApiError(400, 'Username and password are required.'));
    try {
        const lastAccount = await Account.findOne().sort({ displayOrder: -1 });
        const displayOrder = lastAccount ? lastAccount.displayOrder + 1 : 1;
        const newAccount = new Account({ username, password, displayOrder });
        await newAccount.save();
        res.status(201).json({ success: true, data: newAccount });
    } catch (error) { next(error); }
};

export const getAllAccountsAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accounts = await Account.find().select('+password').sort({ displayOrder: 1 });
        res.status(200).json({ success: true, data: accounts });
    } catch (error) { next(error); }
};

export const updateAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accountData = req.body;
        delete accountData.displayOrder; // Không cho phép cập nhật displayOrder thủ công
        delete accountData.status; // Không cho phép cập nhật status qua route này

        const updatedAccount = await Account.findByIdAndUpdate(req.params.id, accountData, { new: true }).select('+password');
        if (!updatedAccount) return next(new ApiError(404, 'Account not found'));
        res.status(200).json({ success: true, data: updatedAccount });
    } catch (error) { next(error); }
};

export const deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accountToDelete = await Account.findByIdAndDelete(req.params.id);
        if (!accountToDelete) return next(new ApiError(404, 'Account not found'));
        await Account.updateMany(
            { displayOrder: { $gt: accountToDelete.displayOrder } },
            { $inc: { displayOrder: -1 } }
        );
        res.status(200).json({ success: true, message: 'Account deleted successfully' });
    } catch (error) { next(error); }
};

// **HÀM MỚI CHO CHỨC NĂNG TẠM DỪNG / TIẾP TỤC**
export const toggleAccountStatus = async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.body;
    const { id } = req.params;

    // Chỉ cho phép thay đổi giữa 'available' và 'paused'
    if (status !== 'available' && status !== 'paused') {
        return next(new ApiError(400, 'Trạng thái không hợp lệ.'));
    }

    try {
        const account = await Account.findById(id);
        if (!account) {
            return next(new ApiError(404, 'Account not found'));
        }

        account.status = status;
        await account.save();
        
        // Gửi tín hiệu cập nhật trạng thái đến tất cả client
        req.io.emit('account_updated', { accountId: account._id, newStatus: account.status });

        res.status(200).json({ success: true, data: account });
    } catch (error) {
        next(error);
    }
};