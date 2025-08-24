import session from 'express-session';
import MySQLStore from 'express-mysql-session';
import config from '../../config/index.js';

const MySQLStoreSession = MySQLStore(session);
const sessionStore = new MySQLStoreSession({
  host: config.mysql.host,
  port: config.mysql.port,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database,
  clearExpired: true,
  checkExpirationInterval: 900000, // 15 minutes
  expiration: 86400000, // 24 hours
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
});

const sessionMiddleware = session({
  name: 'sso.sid', // Session name
  secret: config.sessionSecret || 'your-super-secret-session-key-change-this-in-production',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    secure: config.nodeEnv === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS attacks
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: config.nodeEnv === 'production' ? 'none' : 'lax' // For cross-origin requests in production
  },
  rolling: true // Reset expiration on each request
});

export default sessionMiddleware;