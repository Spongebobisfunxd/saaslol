import { createApp } from './app';
import { config } from './config';
import { logger } from './lib/logger';
import { closeDb } from './db/connection';
import { closeRedis } from './lib/redis';

const app = createApp();

const server = app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
});

async function shutdown() {
  logger.info('Shutting down gracefully...');
  server.close();
  await closeDb();
  await closeRedis();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason });
});
