import { Request, Response, NextFunction } from 'express';
import { ConsentService } from './service';

const consentService = new ConsentService();

export class ConsentController {
  static async getCustomerConsents(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { customerId } = req.params;
      const consents = await consentService.getCustomerConsents(tenantId, customerId);
      res.json({ data: consents });
    } catch (error) {
      next(error);
    }
  }

  static async grantConsent(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const dto = {
        ...req.body,
        ipAddress: req.body.ipAddress || req.ip,
        userAgent: req.body.userAgent || req.get('user-agent'),
      };
      const consent = await consentService.grantConsent(tenantId, dto);
      res.status(201).json({ data: consent });
    } catch (error) {
      next(error);
    }
  }

  static async revokeConsent(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const dto = {
        ...req.body,
        ipAddress: req.body.ipAddress || req.ip,
        userAgent: req.body.userAgent || req.get('user-agent'),
      };
      const consent = await consentService.revokeConsent(tenantId, dto);
      res.json({ data: consent });
    } catch (error) {
      next(error);
    }
  }

  static async checkConsent(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { customerId, channel } = req.params;
      const granted = await consentService.checkConsent(tenantId, customerId, channel);
      res.json({ data: { granted } });
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLog(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { customerId } = req.params;
      const logs = await consentService.getAuditLog(tenantId, customerId);
      res.json({ data: logs });
    } catch (error) {
      next(error);
    }
  }

  static async listTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const templates = await consentService.listTemplates(tenantId);
      res.json({ data: templates });
    } catch (error) {
      next(error);
    }
  }

  static async createTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const template = await consentService.createTemplate(tenantId, req.body);
      res.status(201).json({ data: template });
    } catch (error) {
      next(error);
    }
  }
}
