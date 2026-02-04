import { Request, Response, NextFunction } from 'express';
import { StampService } from './service';

const stampService = new StampService();

export class StampController {
  static async listDefinitions(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const definitions = await stampService.listDefinitions(tenantId);
      res.json(definitions);
    } catch (error) {
      next(error);
    }
  }

  static async getDefinitionById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const definition = await stampService.getDefinitionById(tenantId, id);
      res.json({ data: definition });
    } catch (error) {
      next(error);
    }
  }

  static async createDefinition(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const definition = await stampService.createDefinition(tenantId, req.body);
      res.status(201).json({ data: definition });
    } catch (error) {
      next(error);
    }
  }

  static async updateDefinition(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const definition = await stampService.updateDefinition(tenantId, id, req.body);
      res.json({ data: definition });
    } catch (error) {
      next(error);
    }
  }

  static async listCards(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const customerId = req.query.customerId as string | undefined;
      const cards = await stampService.listCards(tenantId, customerId);
      res.json(cards);
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerCards(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { customerId } = req.params;
      const cards = await stampService.getCustomerCards(tenantId, customerId);
      res.json({ data: cards });
    } catch (error) {
      next(error);
    }
  }

  static async addStamp(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { customerId, definitionId, locationId } = req.body;
      const card = await stampService.addStamp(tenantId, customerId, definitionId, locationId);
      res.status(201).json({ data: card });
    } catch (error) {
      next(error);
    }
  }

  static async getCard(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const card = await stampService.getCard(tenantId, id);
      res.json({ data: card });
    } catch (error) {
      next(error);
    }
  }
}
