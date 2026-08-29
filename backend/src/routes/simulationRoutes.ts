import { Router } from 'express';
import { SimulationController } from '../controllers/simulationController';
import { validateBody } from '../middleware/validateRequest';
import { SimulationRunSchema } from '../validators';

const router = Router();

router.post('/run', validateBody(SimulationRunSchema), SimulationController.runSimulation);
router.get('/:id', SimulationController.getSimulationById);

export default router;
