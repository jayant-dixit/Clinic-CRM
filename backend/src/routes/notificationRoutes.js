import { Router } from 'express';
import {
  getNotificationLogs,
  getNotificationTemplates,
  updateNotificationTemplate,
  sendTestNotification,
} from '../controllers/notificationController.js';
import { authenticate, authorize, requireClinic } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate, requireClinic);

router.get('/logs', getNotificationLogs);
router.get('/templates', getNotificationTemplates);
router.put('/templates', authorize('CLINIC_ADMIN', 'SUPER_ADMIN'), updateNotificationTemplate);
router.post('/test', authorize('CLINIC_ADMIN', 'SUPER_ADMIN'), sendTestNotification);

export default router;
