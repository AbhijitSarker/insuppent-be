import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const session = require('express-session');
import dotenv from 'dotenv';
dotenv.config();


// For cross-site SSO, always set SameSite=None and Secure in production
const isProduction = process.env.NODE_ENV === 'production';
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'change_this_secret',
  resave: false,
  saveUninitialized: false,
  proxy: isProduction, // trust proxy for Render/Heroku
  cookie: {
    httpOnly: true,
    secure: isProduction, // must be true for HTTPS
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
});

export default sessionMiddleware;
