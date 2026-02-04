import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',

  database: {
    url: process.env.DATABASE_URL || 'postgres://loyalty:loyalty_dev@localhost:5432/loyalty_saas',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  cors: {
    origins: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3002,http://localhost:3003').split(','),
  },

  ses: {
    region: process.env.SES_REGION || 'eu-central-1',
    accessKey: process.env.SES_ACCESS_KEY || '',
    secretKey: process.env.SES_SECRET_KEY || '',
    fromEmail: process.env.SES_FROM_EMAIL || 'noreply@loyalty.pl',
  },

  smsapi: {
    token: process.env.SMSAPI_TOKEN || '',
    from: process.env.SMSAPI_FROM || 'Loyalty',
  },

  payu: {
    posId: process.env.PAYU_POS_ID || '',
    clientSecret: process.env.PAYU_CLIENT_SECRET || '',
    sandbox: process.env.PAYU_SANDBOX === 'true',
  },
};
