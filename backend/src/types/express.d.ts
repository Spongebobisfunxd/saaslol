import { JwtPayload } from '../middleware/authenticate';

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      kioskDevice?: {
        id: string;
        tenantId: string;
        locationId: string;
        name: string;
      };
    }
  }
}
