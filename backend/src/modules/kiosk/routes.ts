import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { tenantResolver } from '../../middleware/tenantResolver';
import { authorizeMinRole } from '../../middleware/authorize';
import { validateRequest } from '../../middleware/validateRequest';
import { UserRole } from '@loyalty/shared';
import { KioskController } from './controller';
import { KioskService } from './service';
import {
  registerDeviceSchema,
  customerLookupSchema,
  kioskSyncSchema,
} from './validators';

const router = Router();
const kioskService = new KioskService();

// Extend Express Request to include kiosk device info
declare global {
  namespace Express {
    interface Request {
      kioskDevice?: {
        id: string;
        tenant_id: string;
        location_id: string;
        name: string;
        [key: string]: unknown;
      };
      tenantId?: string;
    }
  }
}

/**
 * Device authentication middleware.
 * Reads the device token from the X-Device-Token header,
 * validates it, and attaches device info to the request.
 */
async function authenticateDevice(req: Request, res: Response, next: NextFunction): Promise<void> {
  const deviceToken = req.headers['x-device-token'] as string;

  if (!deviceToken) {
    res.status(401).json({ success: false, message: 'Missing X-Device-Token header' });
    return;
  }

  try {
    const device = await kioskService.authenticateDevice(deviceToken);
    req.kioskDevice = device;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or inactive device token' });
  }
}

// ==================== Admin routes (JWT auth) ====================

// Register a new kiosk device - ADMIN and above
router.post(
  '/devices',
  authenticate,
  tenantResolver,
  authorizeMinRole(UserRole.ADMIN),
  validateRequest({ body: registerDeviceSchema }),
  KioskController.registerDevice,
);

// List all kiosk devices - ADMIN and above
router.get(
  '/devices',
  authenticate,
  tenantResolver,
  authorizeMinRole(UserRole.ADMIN),
  KioskController.listDevices,
);

// ==================== Device-authenticated routes ====================

// Customer lookup via kiosk
router.post(
  '/lookup',
  authenticateDevice,
  validateRequest({ body: customerLookupSchema }),
  KioskController.lookupCustomer,
);

// Sync operations from kiosk
router.post(
  '/sync',
  authenticateDevice,
  validateRequest({ body: kioskSyncSchema }),
  KioskController.sync,
);

// Get sync status for the authenticated device
router.get(
  '/sync/status',
  authenticateDevice,
  KioskController.getSyncStatus,
);

export { router as kioskRoutes };
export default router;
