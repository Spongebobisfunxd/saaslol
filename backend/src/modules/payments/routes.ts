import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { tenantResolver } from '../../middleware/tenantResolver';
import { authorizeMinRole } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { UserRole } from '@loyalty/shared';
import { PaymentController } from './controller';
import {
  createPaymentSchema,
  paymentNotificationSchema,
  paymentFilterSchema,
  idParamSchema,
} from './validators';

const router = Router();

// ==================== Public webhook route ====================

// Payment provider notification webhook (PayU / Tpay)
router.post(
  '/notify',
  validateRequest({ body: paymentNotificationSchema }),
  PaymentController.handleNotification,
);

// ==================== Authenticated routes ====================

// All remaining routes require authentication and tenant resolution
router.use(authenticate, tenantResolver);

// List payments - STAFF and above
router.get(
  '/',
  authorizeMinRole(UserRole.STAFF),
  validateRequest({ query: paymentFilterSchema }),
  PaymentController.list,
);

// Get single payment - STAFF and above
router.get(
  '/:id',
  authorizeMinRole(UserRole.STAFF),
  validateRequest({ params: idParamSchema }),
  PaymentController.getById,
);

// Create payment - MANAGER and above
router.post(
  '/',
  authorizeMinRole(UserRole.MANAGER),
  validateRequest({ body: createPaymentSchema }),
  PaymentController.create,
);

export { router as paymentRoutes };
export default router;
