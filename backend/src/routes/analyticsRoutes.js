import { Router } from 'express';
import { getAnalyticsOverview } from '../controllers/analyticsController.js';
import { authenticate, requireClinic } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate, requireClinic);

router.get('/overview', getAnalyticsOverview);

export default router;
