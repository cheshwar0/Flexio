import { Router } from 'express';
import {
  checkSetupStatus,
  setupFirstAdmin,
  loginAdmin,
  getAdminProfile,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/setup-status', checkSetupStatus);
router.post('/setup', setupFirstAdmin);
router.post('/login', authLimiter, loginAdmin);
router.get('/me', requireAuth, getAdminProfile);

export default router;
