require('dotenv').config();
import express from 'express';
import session from 'express-session';
import { post, get } from 'axios';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'change_this_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

const WP_OAUTH_AUTHORIZE = process.env.WP_OAUTH_AUTHORIZE || 'https://insuppent.com/oauth/authorize';
const WP_OAUTH_TOKEN = process.env.WP_OAUTH_TOKEN || 'https://insuppent.com/oauth/token';
const WP_OAUTH_ME = process.env.WP_OAUTH_ME || 'https://insuppent.com/oauth/me';
const CLIENT_ID = process.env.WP_CLIENT_ID;
const CLIENT_SECRET = process.env.WP_CLIENT_SECRET;
const REDIRECT_URI = process.env.WP_REDIRECT_URI || 'http://localhost:3000/api/auth/callback';

// 1. Login: Redirect to WP OAuth authorize
app.get('/api/auth/login', (req, res) => {
  const state = Math.random().toString(36).substring(2);
  req.session.oauthState = state;
  const url = `${WP_OAUTH_AUTHORIZE}?response_type=code&client_id=${encodeURIComponent(CLIENT_ID)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}`;
  res.redirect(url);
});

// 2. Callback: Exchange code for token, fetch user info, store in session
app.get('/api/auth/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code || !state || state !== req.session.oauthState) {
    return res.status(400).send('Invalid state or code');
  }
  try {
    // Exchange code for token
    const tokenRes = await post(WP_OAUTH_TOKEN, new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const { access_token } = tokenRes.data;
    if (!access_token) throw new Error('No access token');
    // Fetch user info
    const userRes = await get(WP_OAUTH_ME, {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    // Map roles to app roles
    const wpUser = userRes.data;
    const mappedRoles = mapRoles(wpUser.roles || []);
    req.session.user = {
      id: wpUser.id,
      username: wpUser.username,
      email: wpUser.email,
      roles: mappedRoles,
      wpRoles: wpUser.roles
    };
    req.session.save(() => {
      res.redirect(process.env.FRONTEND_URL || '/');
    });
  } catch (err) {
    res.status(500).send('OAuth error: ' + err.message);
  }
});

// 3. User info
app.get('/api/user', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
  res.json(req.session.user);
});

// 4. Logout
app.get('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect(process.env.FRONTEND_URL || '/');
  });
});

function mapRoles(wpRoles) {
  // Map WP/BuddyBoss roles to app roles
  if (!Array.isArray(wpRoles)) return [];
  return wpRoles.map(role => {
    switch (role) {
      case 'administrator': return 'admin';
      case 'subscriber': return 'user';
      case 'member': return 'member';
      default: return role;
    }
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('SSO server running on port', PORT));
