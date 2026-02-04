import { Request, Response, NextFunction } from 'express';
import { AuthService } from './service';

const authService = new AuthService();

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async phoneLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, code } = req.body;
      const result = await authService.phoneLogin(phone, code);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const tokens = await authService.refreshToken(req.body.refreshToken);
      res.json({ success: true, data: tokens });
    } catch (err) {
      next(err);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.logout(req.user!.userId);
      res.json({ success: true, data: { message: 'Logged out successfully' } });
    } catch (err) {
      next(err);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const { getDb } = require('../../db/connection');
      const db = getDb();
      const user = await db('users')
        .join('tenants', 'users.tenant_id', 'tenants.id')
        .where('users.id', req.user!.userId)
        .select('users.id', 'users.email', 'users.first_name', 'users.last_name',
                'users.role', 'users.tenant_id', 'tenants.name as tenant_name')
        .first();

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          tenantId: user.tenant_id,
          tenantName: user.tenant_name,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
