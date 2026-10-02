import { Router } from 'express';
import { getForms, getFormById, createForm, updateForm, duplicateForm, deleteForm } from '../controllers/formController.js';
import { authenticate, authorize, requireClinic } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate, requireClinic);

router.get('/', getForms);
router.get('/:id', getFormById);
router.post('/', authorize('CLINIC_ADMIN', 'SUPER_ADMIN'), createForm);
router.post('/:id/duplicate', authorize('CLINIC_ADMIN', 'SUPER_ADMIN'), duplicateForm);
router.put('/:id', authorize('CLINIC_ADMIN', 'SUPER_ADMIN'), updateForm);
router.delete('/:id', authorize('CLINIC_ADMIN', 'SUPER_ADMIN'), deleteForm);

export default router;
