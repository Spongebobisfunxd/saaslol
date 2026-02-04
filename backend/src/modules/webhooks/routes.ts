import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { tenantResolver } from '../../middleware/tenantResolver';
import { authorizeMinRole } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { UserRole } from '@loyalty/shared';
import { WebhookController } from './controller';
import {
  createWebhookSchema,
  updateWebhookSchema,
  idParamSchema,
  deliveryFilterSchema,
} from './validators';

const router = Router();

// All routes require authentication and tenant resolution
router.use(authenticate, tenantResolver);

// Delivery log - MANAGER and above
router.get(
  '/deliveries',
  authorizeMinRole(UserRole.MANAGER),
  validateRequest({ query: deliveryFilterSchema }),
  WebhookController.getDeliveries,
);

// Webhook endpoint management - ADMIN and above
router.get(
  '/',
  authorizeMinRole(UserRole.ADMIN),
  WebhookController.list,
);

router.post(
  '/',
  authorizeMinRole(UserRole.ADMIN),
  validateRequest({ body: createWebhookSchema }),
  WebhookController.create,
);

router.patch(
  '/:id',
  authorizeMinRole(UserRole.ADMIN),
  validateRequest({ params: idParamSchema, body: updateWebhookSchema }),
  WebhookController.update,
);

router.delete(
  '/:id',
  authorizeMinRole(UserRole.ADMIN),
  validateRequest({ params: idParamSchema }),
  WebhookController.delete,
);

export default router;
