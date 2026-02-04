import { Request, Response, NextFunction } from 'express';
import { WebhookService } from './service';

const webhookService = new WebhookService();

export class WebhookController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const endpoints = await webhookService.list(tenantId);
      res.json({ data: endpoints });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const endpoint = await webhookService.create(tenantId, req.body);
      res.status(201).json({ data: endpoint });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const endpoint = await webhookService.update(tenantId, id, req.body);
      res.json({ data: endpoint });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const result = await webhookService.delete(tenantId, id);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getDeliveries(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const filter = {
        endpointId: req.query.endpointId as string | undefined,
        status: req.query.status as string | undefined,
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 20,
      };
      const result = await webhookService.getDeliveries(tenantId, filter);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
