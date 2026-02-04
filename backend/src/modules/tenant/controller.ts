import { Request, Response, NextFunction } from 'express';
import { TenantService } from './service';

const tenantService = new TenantService();

export class TenantController {
  static async getTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const tenant = await tenantService.getTenant(tenantId);
      res.json({ data: tenant });
    } catch (error) {
      next(error);
    }
  }

  static async updateTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const tenant = await tenantService.updateTenant(tenantId, req.body);
      res.json({ data: tenant });
    } catch (error) {
      next(error);
    }
  }

  static async getLocations(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const locations = await tenantService.getLocations(tenantId);
      res.json({ data: locations });
    } catch (error) {
      next(error);
    }
  }

  static async createLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const location = await tenantService.createLocation(tenantId, req.body);
      res.status(201).json({ data: location });
    } catch (error) {
      next(error);
    }
  }

  static async updateLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const location = await tenantService.updateLocation(tenantId, id, req.body);
      res.json({ data: location });
    } catch (error) {
      next(error);
    }
  }

  static async deleteLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      await tenantService.deleteLocation(tenantId, id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
