import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { tenantResolver } from '../../middleware/tenantResolver';
import { authorizeMinRole } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { UserRole } from '@loyalty/shared';
import { CampaignController } from './controller';
import {
  createCampaignSchema,
  updateCampaignSchema,
  scheduleCampaignSchema,
  idParamSchema,
  recipientsQuerySchema,
} from './validators';

const router = Router();

// All routes require authentication and tenant resolution
router.use(authenticate, tenantResolver);

// GET routes - STAFF and above
router.get(
  '/',
  authorizeMinRole(UserRole.STAFF),
  CampaignController.list,
);

router.get(
  '/:id',
  authorizeMinRole(UserRole.STAFF),
  validateRequest({ params: idParamSchema }),
  CampaignController.getById,
);

// Get campaign recipients - STAFF and above
router.get(
  '/:id/recipients',
  authorizeMinRole(UserRole.STAFF),
  validateRequest({ params: idParamSchema, query: recipientsQuerySchema }),
  CampaignController.getRecipients,
);

// Mutation routes - MANAGER and above
router.post(
  '/',
  authorizeMinRole(UserRole.MANAGER),
  validateRequest({ body: createCampaignSchema }),
  CampaignController.create,
);

router.patch(
  '/:id',
  authorizeMinRole(UserRole.MANAGER),
  validateRequest({ params: idParamSchema, body: updateCampaignSchema }),
  CampaignController.update,
);

// Schedule campaign - MANAGER and above
router.post(
  '/:id/schedule',
  authorizeMinRole(UserRole.MANAGER),
  validateRequest({ params: idParamSchema, body: scheduleCampaignSchema }),
  CampaignController.schedule,
);

// Cancel campaign - MANAGER and above
router.post(
  '/:id/cancel',
  authorizeMinRole(UserRole.MANAGER),
  validateRequest({ params: idParamSchema }),
  CampaignController.cancel,
);

export default router;
