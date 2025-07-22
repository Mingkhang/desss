import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/apiError';

const errorMiddleware = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (statusCode === 500 && process.env.NODE_ENV === 'production' && !err.isOperational) {
      message = 'Internal Server Error';
  }
  
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[ERROR] ${statusCode} - ${message}\nStack: ${err.stack}`);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
};

export default errorMiddleware;