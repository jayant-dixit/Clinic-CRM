import { Router } from 'express';
import { getDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor } from '../controllers/doctorController.js';
import { authenticate, authorize, requireClinic } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate, requireClinic);

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.post('/', authorize('CLINIC_ADMIN', 'SUPER_ADMIN'), createDoctor);
router.put('/:id', authorize('CLINIC_ADMIN', 'SUPER_ADMIN'), updateDoctor);
router.delete('/:id', authorize('CLINIC_ADMIN', 'SUPER_ADMIN'), deleteDoctor);

export default router;
