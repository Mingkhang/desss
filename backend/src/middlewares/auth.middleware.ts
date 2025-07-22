import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/env';
import ApiError from '../utils/apiError';
import Admin from '../models/admin.model';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret) as { id: string };
      const admin = await Admin.findById(decoded.id);

      if (!admin) {
        return next(new ApiError(401, 'Not authorized, admin not found'));
      }
      req.admin = admin;
      next();
    } catch (error) {
      return next(new ApiError(401, 'Not authorized, token failed'));
    }
  }

  if (!token) {
    return next(new ApiError(401, 'Not authorized, no token'));
  }
};