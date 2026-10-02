import { Router } from 'express';
import {
  getClinicProfile,
  updateClinicProfile,
  getClinicStaff,
  addClinicStaff,
  updateClinicStaff,
  getAllClinicsForAdmin,
} from '../controllers/clinicController.js';
import { authenticate, authorize, requireClinic } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

// Super admin list all clinics
router.get('/all', authorize('SUPER_ADMIN'), getAllClinicsForAdmin);

// Clinic-specific endpoints
router.get('/profile', requireClinic, getClinicProfile);
router.put('/profile', requireClinic, authorize('CLINIC_ADMIN', 'SUPER_ADMIN'), updateClinicProfile);

// Staff management
router.get('/staff', requireClinic, getClinicStaff);
router.post('/staff', requireClinic, authorize('CLINIC_ADMIN', 'SUPER_ADMIN'), addClinicStaff);
router.put('/staff/:id', requireClinic, authorize('CLINIC_ADMIN', 'SUPER_ADMIN'), updateClinicStaff);

export default router;
