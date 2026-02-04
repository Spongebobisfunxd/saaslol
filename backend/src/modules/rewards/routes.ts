import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { tenantResolver } from '../../middleware/tenantResolver';
import { authorizeMinRole } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { UserRole } from '@loyalty/shared';
import { RewardController } from './controller';
import {
  createRewardSchema,
  updateRewardSchema,
  idParamSchema,
  redeemRewardSchema,
} from './validators';

const router = Router();

// All routes require authentication and tenant resolution
router.use(authenticate, tenantResolver);

// GET routes - available to STAFF and above
router.get(
  '/',
  authorizeMinRole(UserRole.STAFF),
  RewardController.list,
);

router.get(
  '/:id',
  authorizeMinRole(UserRole.STAFF),
  validateRequest({ params: idParamSchema }),
  RewardController.getById,
);

// Redeem - STAFF and above
router.post(
  '/redeem',
  authorizeMinRole(UserRole.STAFF),
  validateRequest({ body: redeemRewardSchema }),
  RewardController.redeem,
);

// Mutation routes - require MANAGER and above
router.post(
  '/',
  authorizeMinRole(UserRole.MANAGER),
  validateRequest({ body: createRewardSchema }),
  RewardController.create,
);

router.patch(
  '/:id',
  authorizeMinRole(UserRole.MANAGER),
  validateRequest({ params: idParamSchema, body: updateRewardSchema }),
  RewardController.update,
);

export default router;
