import { Router } from 'express';
import {
  getBookingPages,
  getBookingPageById,
  createBookingPage,
  updateBookingPage,
  deleteBookingPage,
} from '../controllers/bookingPageController.js';
import { authenticate, authorize, requireClinic } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate, requireClinic);

router.get('/', getBookingPages);
router.get('/:id', getBookingPageById);
router.post('/', authorize('CLINIC_ADMIN', 'SUPER_ADMIN'), createBookingPage);
router.put('/:id', authorize('CLINIC_ADMIN', 'SUPER_ADMIN'), updateBookingPage);
router.delete('/:id', authorize('CLINIC_ADMIN', 'SUPER_ADMIN'), deleteBookingPage);

export default router;
