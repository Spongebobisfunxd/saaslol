import { Request, Response, NextFunction } from 'express';
import { KioskService } from './service';

const kioskService = new KioskService();

export class KioskController {
  static async registerDevice(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const device = await kioskService.registerDevice(tenantId, req.body);
      res.status(201).json({ data: device });
    } catch (error) {
      next(error);
    }
  }

  static async listDevices(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const devices = await kioskService.listDevices(tenantId);
      res.json({ data: devices });
    } catch (error) {
      next(error);
    }
  }

  static async lookupCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.kioskDevice!.tenant_id;
      const customer = await kioskService.lookupCustomer(tenantId, req.body);
      res.json({ data: customer });
    } catch (error) {
      next(error);
    }
  }

  static async sync(req: Request, res: Response, next: NextFunction) {
    try {
      const device = req.kioskDevice!;
      const results = await kioskService.processSyncQueue(
        device.tenant_id,
        device.id,
        req.body,
      );
      res.json({ data: results });
    } catch (error) {
      next(error);
    }
  }

  static async getSyncStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const device = req.kioskDevice!;
      const status = await kioskService.getDeviceSyncStatus(
        device.tenant_id,
        device.id,
      );
      res.json({ data: status });
    } catch (error) {
      next(error);
    }
  }
}
