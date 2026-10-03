import { Router } from 'express';
import {
  getAppointments,
  getTodayAppointmentStats,
  getAppointmentById,
  createManualAppointment,
  updateAppointment,
  updateAppointmentStatus,
  rescheduleAppointment,
  scheduleFollowUpAppointment,
} from '../controllers/appointmentController.js';
import { authenticate, requireClinic } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate, requireClinic);

router.get('/', getAppointments);
router.get('/stats/today', getTodayAppointmentStats);
router.get('/:id', getAppointmentById);
router.post('/', createManualAppointment);
router.put('/:id', updateAppointment);
router.put('/:id/status', updateAppointmentStatus);
router.post('/:id/reschedule', rescheduleAppointment);
router.post('/:id/follow-up', scheduleFollowUpAppointment);

export default router;
