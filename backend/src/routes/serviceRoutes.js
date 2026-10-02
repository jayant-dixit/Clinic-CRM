import { Router } from 'express';
import { getServices, getServiceById, createService, updateService, deleteService } from '../controllers/serviceController.js';
import { authenticate, authorize, requireClinic } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate, requireClinic);

router.get('/', getServices);
router.get('/:id', getServiceById);
router.post('/', authorize('CLINIC_ADMIN', 'SUPER_ADMIN'), createService);
router.put('/:id', authorize('CLINIC_ADMIN', 'SUPER_ADMIN'), updateService);
router.delete('/:id', authorize('CLINIC_ADMIN', 'SUPER_ADMIN'), deleteService);

export default router;
