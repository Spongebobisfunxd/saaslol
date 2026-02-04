import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { tenantResolver } from '../../middleware/tenantResolver';
import { authorizeMinRole } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { UserRole } from '@loyalty/shared';
import { CustomerController } from './controller';
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerFilterSchema,
  idParamSchema,
} from './validators';

const router = Router();

// All routes require authentication and tenant resolution
router.use(authenticate, tenantResolver);

// GET routes - available to STAFF and above
router.get(
  '/',
  authorizeMinRole(UserRole.STAFF),
  validateRequest({ query: customerFilterSchema }),
  CustomerController.list,
);

router.get(
  '/:id',
  authorizeMinRole(UserRole.STAFF),
  validateRequest({ params: idParamSchema }),
  CustomerController.getById,
);

router.get(
  '/:id/profile',
  authorizeMinRole(UserRole.STAFF),
  validateRequest({ params: idParamSchema }),
  CustomerController.getProfile,
);

// Mutation routes - require MANAGER and above
router.post(
  '/',
  authorizeMinRole(UserRole.MANAGER),
  validateRequest({ body: createCustomerSchema }),
  CustomerController.create,
);

router.patch(
  '/:id',
  authorizeMinRole(UserRole.MANAGER),
  validateRequest({ params: idParamSchema, body: updateCustomerSchema }),
  CustomerController.update,
);

router.delete(
  '/:id',
  authorizeMinRole(UserRole.MANAGER),
  validateRequest({ params: idParamSchema }),
  CustomerController.delete,
);

export default router;
