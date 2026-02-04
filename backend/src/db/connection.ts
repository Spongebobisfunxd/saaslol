import knex, { Knex } from 'knex';
import knexConfig from './knexfile';
import { logger } from '../lib/logger';

let db: Knex;

export function getDb(): Knex {
  if (!db) {
    db = knex(knexConfig);
    logger.info('Database connection pool created');
  }
  return db;
}

export async function closeDb(): Promise<void> {
  if (db) {
    await db.destroy();
    logger.info('Database connection pool closed');
  }
}
