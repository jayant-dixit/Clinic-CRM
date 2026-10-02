import { Router } from 'express';
import {
  getDoctorAvailability,
  updateDoctorAvailability,
  addDateOverride,
  removeDateOverride,
  createBlockedSlot,
  getBlockedSlots,
  deleteBlockedSlot,
  getAvailableSlotsPreview,
} from '../controllers/availabilityController.js';
import { authenticate, authorize, requireClinic } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate, requireClinic);

router.get('/', getDoctorAvailability);
router.get('/slots', getAvailableSlotsPreview);
router.put('/:doctorId', authorize('CLINIC_ADMIN', 'SUPER_ADMIN'), updateDoctorAvailability);
router.post('/:doctorId/override', authorize('CLINIC_ADMIN', 'SUPER_ADMIN'), addDateOverride);
router.delete('/:doctorId/override/:date', authorize('CLINIC_ADMIN', 'SUPER_ADMIN'), removeDateOverride);

router.post('/block-slot', createBlockedSlot);
router.get('/blocked-slots', getBlockedSlots);
router.delete('/blocked-slots/:id', deleteBlockedSlot);

export default router;
