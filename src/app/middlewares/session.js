import session from 'express-session';
import MySQLStore from 'express-mysql-session';
import config from '../../config/index.js';

// Create the database connection options
const options = {
    host: config.mysql.host,
    port: config.mysql.port,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    clearExpired: true,
    checkExpirationInterval: 15 * 60 * 1000, // Clean up every 15 minutes
    expiration: 24 * 60 * 60 * 1000, // 24 hours
    createDatabaseTable: true,
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
};

// Create the session store
const MySQLStoreSession = MySQLStore(session);
const store = new MySQLStoreSession(options);

// Add store error handling
store.on('error', function(error) {
    console.error('Session Store Error:', error);
});

// Configure session middleware
const sessionMiddleware = session({
    name: 'sso.sid',
    secret: config.sessionSecret || 'your-super-secret-session-key-change-this-in-production',
    store: store,
    saveUninitialized: true, // Changed to true to ensure session is saved
    resave: true, // Changed to true to ensure session is saved
    cookie: {
        secure: config.env === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: config.env === 'production' ? 'none' : 'lax', // Changed to lowercase
        path: '/'
    },
    rolling: true,
    proxy: true // Always enable proxy to ensure correct cookie handling
});

// Gracefully handle store errors
store.on('error', function(error) {
    console.error('Session Store Error:', error);
});

export default sessionMiddleware;