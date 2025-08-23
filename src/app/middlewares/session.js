import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const session = require('express-session');
import dotenv from 'dotenv';
dotenv.config();

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'change_this_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
});

export default sessionMiddleware;
