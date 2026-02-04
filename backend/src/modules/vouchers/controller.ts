import { Request, Response, NextFunction } from 'express';
import { VoucherService } from './service';

const voucherService = new VoucherService();

export class VoucherController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const vouchers = await voucherService.list(tenantId);
      res.json({ data: vouchers });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const voucher = await voucherService.getById(tenantId, id);
      res.json({ data: voucher });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const voucher = await voucherService.create(tenantId, req.body);
      res.status(201).json({ data: voucher });
    } catch (error) {
      next(error);
    }
  }

  static async redeem(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const result = await voucherService.redeem(tenantId, req.body);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const voucher = await voucherService.cancel(tenantId, id);
      res.json({ data: voucher });
    } catch (error) {
      next(error);
    }
  }
}
