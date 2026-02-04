import { Request, Response, NextFunction } from 'express';
import { PaymentService } from './service';

const paymentService = new PaymentService();

export class PaymentController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const payment = await paymentService.createPayment(tenantId, req.body);
      res.status(201).json({ data: payment });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const page = parseInt(req.query.page as string, 10) || 1;
      const pageSize = parseInt(req.query.pageSize as string, 10) || 20;
      const result = await paymentService.getPayments(tenantId, page, pageSize);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const payment = await paymentService.getById(tenantId, id);
      res.json({ data: payment });
    } catch (error) {
      next(error);
    }
  }

  static async handleNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await paymentService.handleNotification(req.body);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
}
