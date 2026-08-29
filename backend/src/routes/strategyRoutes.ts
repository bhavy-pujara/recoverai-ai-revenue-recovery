import { Router } from 'express';
import { StrategyController } from '../controllers/strategyController';
import { validateBody } from '../middleware/validateRequest';
import { StrategySimulateSchema } from '../validators';

const router = Router();

router.get('/', StrategyController.getStrategies);
router.post('/simulate', validateBody(StrategySimulateSchema), StrategyController.simulateStrategy);

export default router;
