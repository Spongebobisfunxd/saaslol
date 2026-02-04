import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { tenantResolver } from '../../middleware/tenantResolver';
import { authorizeMinRole } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { UserRole } from '@loyalty/shared';
import { VoucherController } from './controller';
import {
  createVoucherSchema,
  redeemVoucherSchema,
  idParamSchema,
} from './validators';

const router = Router();

// All routes require authentication and tenant resolution
router.use(authenticate, tenantResolver);

// GET routes - STAFF and above
router.get(
  '/',
  authorizeMinRole(UserRole.STAFF),
  VoucherController.list,
);

router.get(
  '/:id',
  authorizeMinRole(UserRole.STAFF),
  validateRequest({ params: idParamSchema }),
  VoucherController.getById,
);

// Redeem - STAFF and above
router.post(
  '/redeem',
  authorizeMinRole(UserRole.STAFF),
  validateRequest({ body: redeemVoucherSchema }),
  VoucherController.redeem,
);

// Create - MANAGER and above
router.post(
  '/',
  authorizeMinRole(UserRole.MANAGER),
  validateRequest({ body: createVoucherSchema }),
  VoucherController.create,
);

// Cancel - MANAGER and above
router.post(
  '/:id/cancel',
  authorizeMinRole(UserRole.MANAGER),
  validateRequest({ params: idParamSchema }),
  VoucherController.cancel,
);

export default router;
