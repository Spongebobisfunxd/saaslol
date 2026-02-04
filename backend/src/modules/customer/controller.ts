import { Request, Response, NextFunction } from 'express';
import { CustomerService } from './service';

const customerService = new CustomerService();

export class CustomerController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const result = await customerService.list(tenantId, req.query as any);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const customer = await customerService.getById(tenantId, id);
      res.json({ data: customer });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const customer = await customerService.create(tenantId, req.body);
      res.status(201).json({ data: customer });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const customer = await customerService.update(tenantId, id, req.body);
      res.json({ data: customer });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      await customerService.delete(tenantId, id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const profile = await customerService.getProfile(tenantId, id);
      res.json({ data: profile });
    } catch (error) {
      next(error);
    }
  }
}
