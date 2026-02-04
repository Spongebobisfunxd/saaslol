import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './service';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  static async getDashboardMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const metrics = await analyticsService.getDashboardMetrics(tenantId);
      res.json(metrics);
    } catch (error) {
      next(error);
    }
  }

  static async getDailyAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const filter = {
        startDate: (req.query.startDate || req.query.dateFrom) as string,
        endDate: (req.query.endDate || req.query.dateTo) as string,
        locationId: req.query.locationId as string | undefined,
      };
      const data = await analyticsService.getDailyAnalytics(tenantId, filter);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  static async rollupDaily(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId!;
      const { date } = req.body;
      const result = await analyticsService.rollupDaily(tenantId, date);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  }
}
