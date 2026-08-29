import { Router } from 'express';
import { AIController } from '../controllers/aiController';
import { validateBody } from '../middleware/validateRequest';
import { AIAnalyzeSchema } from '../validators';

const router = Router();

router.post('/analyze', validateBody(AIAnalyzeSchema), AIController.analyze);
router.post('/batch-analyze', AIController.batchAnalyze);

export default router;
