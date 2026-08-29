import { Router } from 'express';
import transactionRoutes from './transactionRoutes';
import customerRoutes from './customerRoutes';
import analyticsRoutes from './analyticsRoutes';
import recoveryRoutes from './recoveryRoutes';
import simulationRoutes from './simulationRoutes';
import strategyRoutes from './strategyRoutes';
import aiRoutes from './aiRoutes';

const router = Router();

// Base Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'recoverai-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    disclaimer: 'Demo project — simulated payment data. Not affiliated with or endorsed by Razorpay.',
  });
});

// Mount Sub-routers
router.use('/transactions', transactionRoutes);
router.use('/customers', customerRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/recovery', recoveryRoutes);
router.use('/simulation', simulationRoutes);
router.use('/strategies', strategyRoutes);
router.use('/ai', aiRoutes);

export default router;
