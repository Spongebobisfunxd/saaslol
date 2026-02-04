import { Request, Response, NextFunction } from 'express';
import { TransactionService } from './service';

const transactionService = new TransactionService();

export class TransactionController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const pageSize = parseInt(req.query.pageSize as string || req.query.limit as string, 10) || 20;
      const filter = {
        customerId: req.query.customerId as string | undefined,
        locationId: req.query.locationId as string | undefined,
        startDate: (req.query.startDate || req.query.dateFrom) as string | undefined,
        endDate: (req.query.endDate || req.query.dateTo) as string | undefined,
        page: parseInt(req.query.page as string, 10) || 1,
        pageSize,
        sortBy: req.query.sortBy as string | undefined,
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || undefined,
      };
      const result = await transactionService.list(tenantId, filter);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const transaction = await transactionService.getById(tenantId, id);
      res.json({ data: transaction });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const result = await transactionService.create(tenantId, req.body);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  }
}
