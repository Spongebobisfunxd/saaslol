import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { tenantResolver } from '../../middleware/tenantResolver';
import { authorizeMinRole } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { UserRole } from '@loyalty/shared';
import { LoyaltyController } from './controller';
import {
  createProgramSchema,
  updateProgramSchema,
  idParamSchema,
  calculatePointsSchema,
  addPointsSchema,
  burnPointsSchema,
} from './validators';

const router = Router();

// All routes require authentication and tenant resolution
router.use(authenticate, tenantResolver);

// GET routes - available to STAFF and above
router.get(
  '/',
  authorizeMinRole(UserRole.STAFF),
  LoyaltyController.list,
);

router.get(
  '/:id',
  authorizeMinRole(UserRole.STAFF),
  validateRequest({ params: idParamSchema }),
  LoyaltyController.getById,
);

// Points calculation - STAFF and above
router.post(
  '/calculate-points',
  authorizeMinRole(UserRole.STAFF),
  validateRequest({ body: calculatePointsSchema }),
  LoyaltyController.calculatePoints,
);

// Points management - STAFF and above
router.post(
  '/add-points',
  authorizeMinRole(UserRole.STAFF),
  validateRequest({ body: addPointsSchema }),
  LoyaltyController.addPoints,
);

router.post(
  '/burn-points',
  authorizeMinRole(UserRole.STAFF),
  validateRequest({ body: burnPointsSchema }),
  LoyaltyController.burnPoints,
);

// Mutation routes - require MANAGER and above
router.post(
  '/',
  authorizeMinRole(UserRole.MANAGER),
  validateRequest({ body: createProgramSchema }),
  LoyaltyController.create,
);

router.patch(
  '/:id',
  authorizeMinRole(UserRole.MANAGER),
  validateRequest({ params: idParamSchema, body: updateProgramSchema }),
  LoyaltyController.update,
);

router.delete(
  '/:id',
  authorizeMinRole(UserRole.MANAGER),
  validateRequest({ params: idParamSchema }),
  LoyaltyController.delete,
);

export default router;
