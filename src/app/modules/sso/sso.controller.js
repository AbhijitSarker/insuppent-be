// SSO controller: Handles login, callback, user info, logout

import axios from 'axios';
import config from '../../../config/index.js';
import { mapRoles } from './sso.service.js';


const WP_OAUTH_AUTHORIZE = config.wpOauthAuthorize;
const WP_OAUTH_TOKEN = config.wpOauthToken;
const WP_OAUTH_ME = config.wpOauthMe;
const CLIENT_ID = config.wpClientId;
const CLIENT_SECRET = config.wpClientSecret;
const REDIRECT_URI = config.wpRedirectUri;

export function login(req, res) {
  const state = Math.random().toString(36).substring(2);
  req.session.oauthState = state;
  console.log(`SSO login state: ${req.session.oauthState}`);
  const url = `${WP_OAUTH_AUTHORIZE}?response_type=code&client_id=${encodeURIComponent(CLIENT_ID)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}`;
  res.redirect(url);
}

export async function callback(req, res) {
  const { code, state } = req.query;
  console.log(`SSO callback state: ${state}, session state: ${req.session.oauthState}`);
  if (!code || !state || state !== req.session.oauthState) {
    return res.status(400).send('Invalid state or code');
  }
  try {

    let tokenRes;
    try {
      tokenRes = await axios.post(WP_OAUTH_TOKEN, new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
    } catch (tokenErr) {
      console.error('Token endpoint network error:', {
        data: tokenErr.response?.data,
        status: tokenErr.response?.status,
        headers: tokenErr.response?.headers,
        message: tokenErr.message,
        stack: tokenErr.stack
      });
      throw tokenErr;
    }

    console.log('Raw token response:', tokenRes && typeof tokenRes === 'object' ? {
      status: tokenRes.status,
      headers: tokenRes.headers,
      data: tokenRes.data
    } : tokenRes);

    const { access_token } = tokenRes.data || {};
    console.log('Access Token:', access_token);

    if (!access_token) throw new Error('No access token');

    const userRes = await axios.get(WP_OAUTH_ME, {
      headers: { Authorization: `Bearer ${access_token}` }
    });
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
  res.redirect(config.frontendUrl || '/');
    });
  } catch (err) {
    console.error('OAuth token error:', {
      data: err.response?.data,
      status: err.response?.status,
      headers: err.response?.headers,
      message: err.message,
      stack: err.stack
    });
    res.status(500).send('OAuth error: ' + (err.response?.data?.error_description || err.message));
  }
}

export function getUser(req, res) {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
  res.json(req.session.user);
}

export function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
  res.redirect(config.frontendUrl || '/');
  });
}
