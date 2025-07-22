import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../../models/admin.model';
import ApiError from '../../utils/apiError';
import config from '../../config/env';

export const loginAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;
    if (!username || !password) return next(new ApiError(400, 'Please provide username and password'));

    try {
        const admin = await Admin.findOne({ username }).select('+password');
        if (!admin) return next(new ApiError(401, 'Invalid credentials'));

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) return next(new ApiError(401, 'Invalid credentials'));

        const token = jwt.sign({ id: admin._id }, config.jwtSecret, { expiresIn: '1d' });
        res.status(200).json({ success: true, token });
    } catch (error) { next(error); }
};