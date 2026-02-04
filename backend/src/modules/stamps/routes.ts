import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { tenantResolver } from '../../middleware/tenantResolver';
import { authorizeMinRole } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { UserRole } from '@loyalty/shared';
import { StampController } from './controller';
import {
  createStampCardDefSchema,
  updateStampCardDefSchema,
  idParamSchema,
  customerIdParamSchema,
  addStampSchema,
} from './validators';

const router = Router();

// All routes require authentication and tenant resolution
router.use(authenticate, tenantResolver);

// ===== Definitions =====

// GET definitions - STAFF and above
router.get(
  '/definitions',
  authorizeMinRole(UserRole.STAFF),
  StampController.listDefinitions,
);

router.get(
  '/definitions/:id',
  authorizeMinRole(UserRole.STAFF),
  validateRequest({ params: idParamSchema }),
  StampController.getDefinitionById,
);

// Create / update definitions - MANAGER and above
router.post(
  '/definitions',
  authorizeMinRole(UserRole.MANAGER),
  validateRequest({ body: createStampCardDefSchema }),
  StampController.createDefinition,
);

router.patch(
  '/definitions/:id',
  authorizeMinRole(UserRole.MANAGER),
  validateRequest({ params: idParamSchema, body: updateStampCardDefSchema }),
  StampController.updateDefinition,
);

// ===== Cards =====

// List stamp cards (optionally filtered by customerId query param)
router.get(
  '/cards',
  authorizeMinRole(UserRole.STAFF),
  StampController.listCards,
);

// Get customer's stamp cards
router.get(
  '/customers/:customerId/cards',
  authorizeMinRole(UserRole.STAFF),
  validateRequest({ params: customerIdParamSchema }),
  StampController.getCustomerCards,
);

// Get a single stamp card with events
router.get(
  '/cards/:id',
  authorizeMinRole(UserRole.STAFF),
  validateRequest({ params: idParamSchema }),
  StampController.getCard,
);

// Add stamp - STAFF and above
router.post(
  '/add-stamp',
  authorizeMinRole(UserRole.STAFF),
  validateRequest({ body: addStampSchema }),
  StampController.addStamp,
);

export default router;
