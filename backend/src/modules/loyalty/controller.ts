import { Request, Response, NextFunction } from 'express';
import { LoyaltyService } from './service';

const loyaltyService = new LoyaltyService();

export class LoyaltyController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const programs = await loyaltyService.list(tenantId);
      res.json({ data: programs });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const program = await loyaltyService.getById(tenantId, id);
      res.json({ data: program });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const program = await loyaltyService.create(tenantId, req.body);
      res.status(201).json({ data: program });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const program = await loyaltyService.update(tenantId, id, req.body);
      res.json({ data: program });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      await loyaltyService.delete(tenantId, id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async calculatePoints(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { amount, customerId } = req.body;
      const points = await loyaltyService.calculatePointsForTransaction(tenantId, amount, customerId);
      res.json({ data: { points } });
    } catch (error) {
      next(error);
    }
  }

  static async addPoints(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { customerId, amount, description, referenceType, referenceId } = req.body;
      const result = await loyaltyService.addPoints(
        tenantId, customerId, amount, description, referenceType, referenceId,
      );
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async burnPoints(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { customerId, amount, description, referenceType, referenceId } = req.body;
      const result = await loyaltyService.burnPoints(
        tenantId, customerId, amount, description, referenceType, referenceId,
      );
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
}
