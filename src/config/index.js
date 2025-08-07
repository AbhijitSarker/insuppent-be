import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env' });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 5000,
  database: {
    url: process.env.DATABASE_URL,
    dbName: process.env.DB_NAME,
  },
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS || 12,
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expires_in: process.env.JWT_EXPIRES_IN || '7d',
    refresh_secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
};
