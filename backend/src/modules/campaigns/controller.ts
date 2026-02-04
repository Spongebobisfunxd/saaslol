import { Request, Response, NextFunction } from 'express';
import { CampaignService } from './service';

const campaignService = new CampaignService();

export class CampaignController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const campaigns = await campaignService.list(tenantId);
      res.json(campaigns);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const campaign = await campaignService.getById(tenantId, id);
      res.json({ data: campaign });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const campaign = await campaignService.create(tenantId, req.body);
      res.status(201).json({ data: campaign });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const campaign = await campaignService.update(tenantId, id, req.body);
      res.json({ data: campaign });
    } catch (error) {
      next(error);
    }
  }

  static async schedule(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const { scheduledAt } = req.body;
      const campaign = await campaignService.schedule(tenantId, id, scheduledAt);
      res.json({ data: campaign });
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const campaign = await campaignService.cancel(tenantId, id);
      res.json({ data: campaign });
    } catch (error) {
      next(error);
    }
  }

  static async getRecipients(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const page = parseInt(req.query.page as string, 10) || 1;
      const pageSize = parseInt(req.query.pageSize as string, 10) || 20;
      const result = await campaignService.getRecipients(tenantId, id, page, pageSize);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
