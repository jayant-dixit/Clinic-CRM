import { Router } from 'express';
import { getTodayQueue, callNextPatient, skipPatient, completeCurrentPatient } from '../controllers/queueController.js';
import { authenticate, requireClinic } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate, requireClinic);

router.get('/', getTodayQueue);
router.post('/call-next', callNextPatient);
router.post('/items/:itemId/skip', skipPatient);
router.post('/items/:itemId/complete', completeCurrentPatient);

export default router;
