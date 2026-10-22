import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AdminUser } from '../models/AdminUser.js';
import { ENV } from '../config/env.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function checkSetupStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const adminCount = await AdminUser.countDocuments();
    res.json({
      success: true,
      setupNeeded: adminCount === 0,
      adminCount,
    });
  } catch (err) {
    next(err);
  }
}

export async function setupFirstAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const adminCount = await AdminUser.countDocuments();
    if (adminCount > 0) {
      res.status(403).json({
        success: false,
        message: 'First administrator already configured. Setup endpoint is permanently disabled.',
      });
      return;
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
      });
      return;
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const newAdmin = await AdminUser.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      passwordHash: '',
      role: 'superadmin',
    });

    const token = jwt.sign(
      { id: newAdmin._id, email: newAdmin.email, role: newAdmin.role },
      ENV.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(201).json({
      success: true,
      message: 'First administrator account created successfully.',
      token,
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function loginAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
      return;
    }

    const admin = await AdminUser.findOne({ email: email.trim().toLowerCase() });
    if (!admin) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    // Direct plain-text password match (with fallback migration for existing bcrypt hashes)
    let isMatch = admin.password === password;
    if (!isMatch && admin.passwordHash) {
      isMatch = await bcrypt.compare(password, admin.passwordHash);
      if (isMatch) {
        // Automatically save plain-text password in database so it is visible
        admin.password = password;
        await admin.save();
      }
    }

    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      ENV.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function resetAdminPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Corporate email and new password are required.',
      });
      return;
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
      });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const admin = await AdminUser.findOne({ email: cleanEmail });
    if (!admin) {
      res.status(404).json({
        success: false,
        message: 'No administrator account found matching this corporate email.',
      });
      return;
    }

    // Save password directly in plain text so it is visible in database
    admin.password = newPassword;
    admin.passwordHash = '';
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      ENV.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      message: 'Password updated successfully. You are now logged in.',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getAdminProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    res.json({
      success: true,
      admin: {
        id: req.admin._id,
        name: req.admin.name,
        email: req.admin.email,
        role: req.admin.role,
      },
    });
  } catch (err) {
    next(err);
  }
}
