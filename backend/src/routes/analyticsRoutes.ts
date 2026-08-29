import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';

const router = Router();

router.get('/overview', AnalyticsController.getOverview);
router.get('/revenue', AnalyticsController.getRevenueTrend);
router.get('/recovery', AnalyticsController.getRecoveryFunnel);
router.get('/payment-methods', AnalyticsController.getPaymentMethods);
router.get('/failure-reasons', AnalyticsController.getFailureReasons);
router.get('/insights', AnalyticsController.getAIInsights);

export default router;
