import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { tenantResolver } from '../../middleware/tenantResolver';
import { authorizeMinRole } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { UserRole } from '@loyalty/shared';
import { ConsentController } from './controller';
import {
  grantConsentSchema,
  revokeConsentSchema,
  createConsentTemplateSchema,
  customerIdParamSchema,
  checkConsentParamsSchema,
} from './validators';

const router = Router();

// All routes require authentication and tenant resolution
router.use(authenticate, tenantResolver);

// GET consents for a customer - STAFF and above
router.get(
  '/customers/:customerId',
  authorizeMinRole(UserRole.STAFF),
  validateRequest({ params: customerIdParamSchema }),
  ConsentController.getCustomerConsents,
);

// Check specific consent - STAFF and above
router.get(
  '/check/:customerId/:channel',
  authorizeMinRole(UserRole.STAFF),
  validateRequest({ params: checkConsentParamsSchema }),
  ConsentController.checkConsent,
);

// Get audit log for a customer - MANAGER and above
router.get(
  '/audit/:customerId',
  authorizeMinRole(UserRole.MANAGER),
  validateRequest({ params: customerIdParamSchema }),
  ConsentController.getAuditLog,
);

// Grant consent - STAFF and above
router.post(
  '/grant',
  authorizeMinRole(UserRole.STAFF),
  validateRequest({ body: grantConsentSchema }),
  ConsentController.grantConsent,
);

// Revoke consent - STAFF and above
router.post(
  '/revoke',
  authorizeMinRole(UserRole.STAFF),
  validateRequest({ body: revokeConsentSchema }),
  ConsentController.revokeConsent,
);

// List consent templates - STAFF and above
router.get(
  '/templates',
  authorizeMinRole(UserRole.STAFF),
  ConsentController.listTemplates,
);

// Create consent template - MANAGER and above
router.post(
  '/templates',
  authorizeMinRole(UserRole.MANAGER),
  validateRequest({ body: createConsentTemplateSchema }),
  ConsentController.createTemplate,
);

export default router;
