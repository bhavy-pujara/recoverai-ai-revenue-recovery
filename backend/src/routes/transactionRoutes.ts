import { Router } from 'express';
import { TransactionController } from '../controllers/transactionController';
import { validateBody, validateQuery } from '../middleware/validateRequest';
import { CreateTransactionSchema, TransactionQuerySchema } from '../validators';

const router = Router();

router.get('/', validateQuery(TransactionQuerySchema), TransactionController.getTransactions);
router.get('/:id', TransactionController.getTransactionById);
router.post('/', validateBody(CreateTransactionSchema), TransactionController.createTransaction);

export default router;
