import { Router } from 'express';
import { getCurrentDisplayLeaderboard, getTopTeamLeaderDisplay } from '../controllers/displayController.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public endpoint for TV display screens
router.get('/current', apiLimiter, getCurrentDisplayLeaderboard);
router.get('/team-leader', apiLimiter, getTopTeamLeaderDisplay);

export default router;

