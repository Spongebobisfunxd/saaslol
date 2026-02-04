import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@loyalty/shared';

const roleHierarchy: Record<UserRole, number> = {
  [UserRole.OWNER]: 40,
  [UserRole.ADMIN]: 30,
  [UserRole.MANAGER]: 20,
  [UserRole.STAFF]: 10,
};

export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Insufficient permissions' });
      return;
    }

    next();
  };
}

export function authorizeMinRole(minRole: UserRole) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const userLevel = roleHierarchy[req.user.role] || 0;
    const requiredLevel = roleHierarchy[minRole] || 0;

    if (userLevel < requiredLevel) {
      res.status(403).json({ success: false, message: 'Insufficient permissions' });
      return;
    }

    next();
  };
}
