import { Request, Response, NextFunction } from 'express';
import Voucher from '../../models/voucher.model';
import ApiError from '../../utils/apiError';
import { generateNewVoucher } from '../../services/voucher.service';

export const getAllVouchers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const vouchers = await Voucher.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: vouchers });
    } catch (error) {
        next(error);
    }
};

export const createVoucherByAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newVoucher = await generateNewVoucher();
        res.status(201).json({ success: true, data: newVoucher });
    } catch (error) {
        next(error);
    }
};

export const deleteVoucherByAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const voucher = await Voucher.findByIdAndDelete(req.params.id);
        if (!voucher) {
            return next(new ApiError(404, 'Voucher not found'));
        }
        res.status(200).json({ success: true, message: 'Voucher deleted successfully' });
    } catch (error) {
        next(error);
    }
};