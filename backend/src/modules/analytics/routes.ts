import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { tenantResolver } from '../../middleware/tenantResolver';
import { authorizeMinRole } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { UserRole } from '@loyalty/shared';
import { AnalyticsController } from './controller';
import { analyticsFilterSchema, rollupDateSchema } from './validators';

const router = Router();

// All routes require authentication and tenant resolution
router.use(authenticate, tenantResolver);

// Dashboard metrics - MANAGER and above
router.get(
  '/dashboard',
  authorizeMinRole(UserRole.MANAGER),
  AnalyticsController.getDashboardMetrics,
);

// Daily analytics - MANAGER and above
router.get(
  '/daily',
  authorizeMinRole(UserRole.MANAGER),
  validateRequest({ query: analyticsFilterSchema }),
  AnalyticsController.getDailyAnalytics,
);

// Rollup endpoint (used by cron job / admin) - MANAGER and above
router.post(
  '/rollup',
  authorizeMinRole(UserRole.MANAGER),
  validateRequest({ body: rollupDateSchema }),
  AnalyticsController.rollupDaily,
);

export default router;
