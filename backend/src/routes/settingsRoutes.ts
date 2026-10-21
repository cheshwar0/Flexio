import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Protect all admin settings endpoints
router.use(requireAuth);

router.get('/', getSettings);
router.put('/', updateSettings);

export default router;
