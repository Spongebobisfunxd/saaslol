import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { defaultLimiter } from './middleware/rateLimiter';

// Module routes
import { authRoutes } from './modules/auth/routes';
import tenantRoutes from './modules/tenant/routes';
import customerRoutes from './modules/customer/routes';
import loyaltyRoutes from './modules/loyalty/routes';
import rewardRoutes from './modules/rewards/routes';
import stampCardRoutes from './modules/stamps/routes';
import consentRoutes from './modules/consent/routes';
import transactionRoutes from './modules/transactions/routes';
import campaignRoutes from './modules/campaigns/routes';
import { kioskRoutes } from './modules/kiosk/routes';
import { paymentRoutes } from './modules/payments/routes';
import { posRoutes } from './modules/pos/routes';
import analyticsRoutes from './modules/analytics/routes';
import giftCardRoutes from './modules/gift-cards/routes';
import voucherRoutes from './modules/vouchers/routes';
import webhookRoutes from './modules/webhooks/routes';

export function createApp() {
  const app = express();

  // Global middleware
  app.use(helmet());
  app.use(compression());
  app.use(cors({ origin: config.cors.origins, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(morgan(config.isDev ? 'dev' : 'combined'));
  app.use(defaultLimiter);

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  const api = express.Router();
  api.use('/auth', authRoutes);
  api.use('/tenants', tenantRoutes);
  api.use('/customers', customerRoutes);
  api.use('/programs', loyaltyRoutes);
  api.use('/rewards', rewardRoutes);
  api.use('/stamps', stampCardRoutes);
  api.use('/consents', consentRoutes);
  api.use('/transactions', transactionRoutes);
  api.use('/campaigns', campaignRoutes);
  api.use('/kiosk', kioskRoutes);
  api.use('/payments', paymentRoutes);
  api.use('/pos', posRoutes);
  api.use('/analytics', analyticsRoutes);
  api.use('/gift-cards', giftCardRoutes);
  api.use('/vouchers', voucherRoutes);
  api.use('/webhooks', webhookRoutes);

  app.use('/api/v1', api);

  // Error handler
  app.use(errorHandler);

  return app;
}
