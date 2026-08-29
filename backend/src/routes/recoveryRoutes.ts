import { Router } from 'express';
import { RecoveryController } from '../controllers/recoveryController';
import { validateBody } from '../middleware/validateRequest';
import { RecoveryActionSchema } from '../validators';

const router = Router();

router.post('/:transactionId/retry', validateBody(RecoveryActionSchema), RecoveryController.retry);
router.post('/:transactionId/remind', validateBody(RecoveryActionSchema), RecoveryController.remind);
router.post('/:transactionId/schedule', validateBody(RecoveryActionSchema), RecoveryController.schedule);
router.post('/:transactionId/mark-recovered', RecoveryController.markRecovered);
router.post('/:transactionId/mark-lost', RecoveryController.markLost);

export default router;
