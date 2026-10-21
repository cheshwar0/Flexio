import { Router } from 'express';
import { getTeams, updateTeams } from '../controllers/teamController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Protect all admin team management endpoints
router.use(requireAuth);

router.get('/', getTeams);
router.put('/', updateTeams);

export default router;
