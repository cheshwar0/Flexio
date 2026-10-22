import { Router } from 'express';
import {
  checkSetupStatus,
  setupFirstAdmin,
  loginAdmin,
  resetAdminPassword,
  getAdminProfile,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/setup-status', checkSetupStatus);
router.post('/setup', setupFirstAdmin);
router.post('/login', authLimiter, loginAdmin);
router.post('/reset-password', authLimiter, resetAdminPassword);
router.get('/me', requireAuth, getAdminProfile);

export default router;
