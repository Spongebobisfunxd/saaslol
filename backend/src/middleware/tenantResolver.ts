import { Request, Response, NextFunction } from 'express';
import { getDb } from '../db/connection';

export async function tenantResolver(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user?.tenantId) {
    res.status(403).json({ success: false, message: 'No tenant context' });
    return;
  }

  try {
    const db = getDb();
    // Set RLS context for this connection
    await db.raw(`SET app.current_tenant = '${req.user.tenantId}'`);
    req.tenantId = req.user.tenantId;
    next();
  } catch (err) {
    next(err);
  }
}
