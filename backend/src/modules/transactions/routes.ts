import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { tenantResolver } from '../../middleware/tenantResolver';
import { authorizeMinRole } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { UserRole } from '@loyalty/shared';
import { TransactionController } from './controller';
import {
  createTransactionSchema,
  transactionFilterSchema,
  idParamSchema,
} from './validators';

const router = Router();

// All routes require authentication and tenant resolution
router.use(authenticate, tenantResolver);

// GET routes - STAFF and above
router.get(
  '/',
  authorizeMinRole(UserRole.STAFF),
  validateRequest({ query: transactionFilterSchema }),
  TransactionController.list,
);

router.get(
  '/:id',
  authorizeMinRole(UserRole.STAFF),
  validateRequest({ params: idParamSchema }),
  TransactionController.getById,
);

// Create transaction - STAFF and above
router.post(
  '/',
  authorizeMinRole(UserRole.STAFF),
  validateRequest({ body: createTransactionSchema }),
  TransactionController.create,
);

export default router;
