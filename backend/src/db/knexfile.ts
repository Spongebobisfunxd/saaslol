import type { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const connection: Knex.Config = {
  client: 'pg',
  connection: process.env.DATABASE_URL || 'postgres://loyalty:loyalty_dev@localhost:5432/loyalty_saas',
  migrations: {
    directory: './migrations',
    extension: 'ts',
  },
  seeds: {
    directory: './seeds',
    extension: 'ts',
  },
  pool: {
    min: 2,
    max: 10,
  },
};

export default connection;
