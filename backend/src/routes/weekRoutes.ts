import { Router } from 'express';
import {
  getWeeks,
  getWeekById,
  createWeek,
  updateWeek,
  publishWeek,
  publishNewWeeklyTop10,
  deleteWeek,
} from '../controllers/weekController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Protect all HR weekly management routes
router.use(requireAuth);

router.get('/', getWeeks);
router.post('/publish-top10', publishNewWeeklyTop10);
router.get('/:id', getWeekById);
router.post('/', createWeek);
router.put('/:id', updateWeek);
router.post('/:id/publish', publishWeek);
router.delete('/:id', deleteWeek);

export default router;
