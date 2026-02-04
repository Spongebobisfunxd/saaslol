import { Request, Response, NextFunction } from 'express';
import { RewardService } from './service';

const rewardService = new RewardService();

export class RewardController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const rewards = await rewardService.list(tenantId);
      res.json({ data: rewards });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const reward = await rewardService.getById(tenantId, id);
      res.json({ data: reward });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const reward = await rewardService.create(tenantId, req.body);
      res.status(201).json({ data: reward });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const reward = await rewardService.update(tenantId, id, req.body);
      res.json({ data: reward });
    } catch (error) {
      next(error);
    }
  }

  static async redeem(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { customerId, rewardId } = req.body;
      const result = await rewardService.redeem(tenantId, customerId, rewardId);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  }
}
