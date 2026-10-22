import { Router } from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  toggleEmployeeStatus,
  uploadEmployeePhoto,
  bulkImportEmployees,
  getCsvTemplate,
} from '../controllers/employeeController.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Protect all employee management routes
router.use(requireAuth);

router.get('/', getEmployees);
router.get('/template', getCsvTemplate);
router.post('/bulk-import', bulkImportEmployees);
router.get('/:id', getEmployeeById);
router.post('/', createEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);
router.patch('/:id/toggle-status', toggleEmployeeStatus);
router.post('/:id/photo', upload.single('photo'), uploadEmployeePhoto);

export default router;
