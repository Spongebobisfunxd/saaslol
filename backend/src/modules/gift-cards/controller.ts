import { Request, Response, NextFunction } from 'express';
import { GiftCardService } from './service';

const giftCardService = new GiftCardService();

export class GiftCardController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const giftCards = await giftCardService.list(tenantId);
      res.json({ data: giftCards });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const giftCard = await giftCardService.getById(tenantId, id);
      res.json({ data: giftCard });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const giftCard = await giftCardService.create(tenantId, req.body);
      res.status(201).json({ data: giftCard });
    } catch (error) {
      next(error);
    }
  }

  static async addTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const result = await giftCardService.addTransaction(tenantId, req.body);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const giftCard = await giftCardService.cancel(tenantId, id);
      res.json({ data: giftCard });
    } catch (error) {
      next(error);
    }
  }
}
