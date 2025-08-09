import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 5000,
  // Legacy Mongo config kept for reference; not used after MySQL migration
  database: {
    url: process.env.DATABASE_URL,
    dbName: process.env.DB_NAME,
  },
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'insuppent',
    logging: process.env.MYSQL_LOGGING === 'true',
  },
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS || 12,
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expires_in: process.env.JWT_EXPIRES_IN || '7d',
    refresh_secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
};
