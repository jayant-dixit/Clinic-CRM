import { Router } from 'express';
import {
  getPublicBookingConfig,
  getPublicAvailableSlots,
  createPublicAppointment,
  getPublicAppointmentByNumber,
  cancelPublicAppointment,
} from '../controllers/publicBookingController.js';

const router = Router();

// Public routes - no authentication required
router.get('/:clinicSlug/:bookingSlug', getPublicBookingConfig);
router.get('/:clinicSlug/:bookingSlug/slots', getPublicAvailableSlots);
router.post('/:clinicSlug/:bookingSlug', createPublicAppointment);

// Patient appointment lookup & management by unique code
router.get('/appointment/:appointmentNumber', getPublicAppointmentByNumber);
router.post('/appointment/:appointmentNumber/cancel', cancelPublicAppointment);

export default router;
