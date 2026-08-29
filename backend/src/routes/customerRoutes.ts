import { Router } from 'express';
import { CustomerController } from '../controllers/customerController';

const router = Router();

router.get('/', CustomerController.getCustomers);
router.get('/:id', CustomerController.getCustomerById);

export default router;
