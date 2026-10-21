import { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env.js';

export interface AppError extends Error {
  statusCode?: number;
  errors?: any;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Safe logging in server console
  console.error(`[Error] ${req.method} ${req.url} - Status ${statusCode}:`, err.message);

  if (statusCode === 500 && ENV.NODE_ENV === 'production') {
    res.status(500).json({
      success: false,
      message: 'An unexpected internal error occurred. Please contact the administrator.',
    });
    return;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || undefined,
    stack: ENV.NODE_ENV === 'development' ? err.stack : undefined,
  });
}
