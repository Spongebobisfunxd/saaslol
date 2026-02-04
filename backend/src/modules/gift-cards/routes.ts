import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { tenantResolver } from '../../middleware/tenantResolver';
import { authorizeMinRole } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { UserRole } from '@loyalty/shared';
import { GiftCardController } from './controller';
import {
  createGiftCardSchema,
  giftCardTransactionSchema,
  idParamSchema,
} from './validators';

const router = Router();

// All routes require authentication and tenant resolution
router.use(authenticate, tenantResolver);

// GET routes - STAFF and above
router.get(
  '/',
  authorizeMinRole(UserRole.STAFF),
  GiftCardController.list,
);

router.get(
  '/:id',
  authorizeMinRole(UserRole.STAFF),
  validateRequest({ params: idParamSchema }),
  GiftCardController.getById,
);

// Transactions (load/redeem) - STAFF and above
router.post(
  '/transactions',
  authorizeMinRole(UserRole.STAFF),
  validateRequest({ body: giftCardTransactionSchema }),
  GiftCardController.addTransaction,
);

// Create - MANAGER and above
router.post(
  '/',
  authorizeMinRole(UserRole.MANAGER),
  validateRequest({ body: createGiftCardSchema }),
  GiftCardController.create,
);

// Cancel - MANAGER and above
router.post(
  '/:id/cancel',
  authorizeMinRole(UserRole.MANAGER),
  validateRequest({ params: idParamSchema }),
  GiftCardController.cancel,
);

export default router;
