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
    secure: process.env.NODE_ENV === 'production', // true only in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' // None for cross-origin, Lax for local
  },
  rolling: true // Reset expiration on each request
});

export default sessionMiddleware;