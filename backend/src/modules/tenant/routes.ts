import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { tenantResolver } from '../../middleware/tenantResolver';
import { authorizeMinRole as authorize } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { UserRole } from '@loyalty/shared';
import { TenantController } from './controller';
import {
  updateTenantSchema,
  createLocationSchema,
  updateLocationSchema,
  idParamSchema,
} from './validators';

const router = Router();

// All routes require authentication and tenant resolution
router.use(authenticate, tenantResolver);

// Tenant routes
router.get('/', TenantController.getTenant);

router.patch(
  '/',
  authorize(UserRole.ADMIN),
  validateRequest({ body: updateTenantSchema }),
  TenantController.updateTenant,
);

// Location routes
router.get('/locations', TenantController.getLocations);

router.post(
  '/locations',
  authorize(UserRole.ADMIN),
  validateRequest({ body: createLocationSchema }),
  TenantController.createLocation,
);

router.patch(
  '/locations/:id',
  authorize(UserRole.ADMIN),
  validateRequest({ params: idParamSchema, body: updateLocationSchema }),
  TenantController.updateLocation,
);

router.delete(
  '/locations/:id',
  authorize(UserRole.ADMIN),
  validateRequest({ params: idParamSchema }),
  TenantController.deleteLocation,
);

export default router;
