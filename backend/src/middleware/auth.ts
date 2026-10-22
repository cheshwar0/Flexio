import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { AdminUser, IAdminUser } from '../models/AdminUser.js';

export interface AuthenticatedRequest extends Request {
  admin?: IAdminUser;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Missing or invalid Bearer token.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, ENV.JWT_SECRET);
    } catch (jwtErr) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token. Please log in again.',
      });
      return;
    }

    const admin = await AdminUser.findById(decoded.id).select('-passwordHash');
    if (!admin) {
      res.status(401).json({
        success: false,
        message: 'Admin account not found or has been revoked.',
      });
      return;
    }

    req.admin = admin;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Global Security Middleware:
 * Guarantees that ALL write operations (POST, PUT, PATCH, DELETE) across
 * the API strictly require authenticated administrator credentials.
 * Only public login and first-admin initialization are exempted.
 */
export async function authenticateAdminWriteOperations(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

  if (!writeMethods.includes(req.method)) {
    return next();
  }

  // Exempt public authentication endpoints (login, first-admin initialization, and password reset)
  const fullPath = (req.originalUrl || req.path).split('?')[0];
  if (
    fullPath === '/api/auth/login' ||
    fullPath === '/api/auth/setup' ||
    fullPath === '/api/auth/reset-password' ||
    req.path === '/auth/login' ||
    req.path === '/auth/setup' ||
    req.path === '/auth/reset-password' ||
    req.path === '/login' ||
    req.path === '/setup' ||
    req.path === '/reset-password'
  ) {
    return next();
  }

  // Enforce admin authentication
  return requireAuth(req, res, next);
}
