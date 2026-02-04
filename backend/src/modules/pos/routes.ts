import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { tenantResolver } from '../../middleware/tenantResolver';
import { authorizeMinRole } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { UserRole } from '@loyalty/shared';
import { PosController } from './controller';
import {
  createPosIntegrationSchema,
  updatePosIntegrationSchema,
  posReceiptSchema,
  idParamSchema,
  integrationIdParamSchema,
} from './validators';

const router = Router();

// ==================== Public webhook route ====================

// POS receipt webhook - validates webhook secret in controller
router.post(
  '/receipt/:integrationId',
  validateRequest({ params: integrationIdParamSchema, body: posReceiptSchema }),
  PosController.handleReceipt,
);

// ==================== Authenticated routes ====================

// All remaining routes require authentication and tenant resolution
router.use(authenticate, tenantResolver);

// List POS integrations - ADMIN and above
router.get(
  '/integrations',
  authorizeMinRole(UserRole.ADMIN),
  PosController.listIntegrations,
);

// Create POS integration - ADMIN and above
router.post(
  '/integrations',
  authorizeMinRole(UserRole.ADMIN),
  validateRequest({ body: createPosIntegrationSchema }),
  PosController.createIntegration,
);

// Update POS integration - ADMIN and above
router.patch(
  '/integrations/:id',
  authorizeMinRole(UserRole.ADMIN),
  validateRequest({ params: idParamSchema, body: updatePosIntegrationSchema }),
  PosController.updateIntegration,
);

// Delete (soft) POS integration - ADMIN and above
router.delete(
  '/integrations/:id',
  authorizeMinRole(UserRole.ADMIN),
  validateRequest({ params: idParamSchema }),
  PosController.deleteIntegration,
);

export { router as posRoutes };
export default router;
