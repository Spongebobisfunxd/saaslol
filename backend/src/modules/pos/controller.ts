import { Request, Response, NextFunction } from 'express';
import { PosService } from './service';

const posService = new PosService();

export class PosController {
  static async listIntegrations(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const integrations = await posService.listIntegrations(tenantId);
      res.json({ data: integrations });
    } catch (error) {
      next(error);
    }
  }

  static async createIntegration(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const integration = await posService.createIntegration(tenantId, req.body);
      res.status(201).json({ data: integration });
    } catch (error) {
      next(error);
    }
  }

  static async updateIntegration(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const integration = await posService.updateIntegration(tenantId, id, req.body);
      res.json({ data: integration });
    } catch (error) {
      next(error);
    }
  }

  static async deleteIntegration(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const result = await posService.deleteIntegration(tenantId, id);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async handleReceipt(req: Request, res: Response, next: NextFunction) {
    try {
      const { integrationId } = req.params;
      const webhookSecret = req.headers['x-webhook-secret'] as string;

      if (!webhookSecret) {
        res.status(401).json({ success: false, message: 'Missing X-Webhook-Secret header' });
        return;
      }

      const result = await posService.handleReceipt(integrationId, req.body, webhookSecret);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
}
