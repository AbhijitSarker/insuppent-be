import axios from 'axios';
import config from '../../../config/index.js';
import { mapRoles } from './sso.service.js';
import { UserService } from '../user/user.service.js';

const WP_OAUTH_AUTHORIZE = config.wpOauthAuthorize;
const WP_OAUTH_TOKEN = config.wpOauthToken;
const WP_OAUTH_ME = config.wpOauthMe;
const CLIENT_ID = config.wpClientId;
const CLIENT_SECRET = config.wpClientSecret;
const REDIRECT_URI = config.wpRedirectUri;

export function login(req, res) {
  // Create a timestamp-based state with some randomness
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const state = `${timestamp}.${random}`;
  
  const url = `${WP_OAUTH_AUTHORIZE}?response_type=code&client_id=${encodeURIComponent(CLIENT_ID)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&scope=profile email`;
  res.redirect(url);
}

export async function callback(req, res) {
  const { code, state } = req.query;

  if (!code || !state || state !== req.session.oauthState) {
    console.error('Invalid state or code in SSO callback');
    return res.redirect(`${config.frontendUrl}/auth/login?error=invalid_callback`);
  }

  try {
    // Exchange code for token
    const tokenRes = await axios.post(WP_OAUTH_TOKEN, new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token, refresh_token, expires_in } = tokenRes.data || {};
    console.log('OAuth token response:', tokenRes.data);

    if (!access_token) {
      throw new Error('No access token received from WordPress');
    }


    // Get user information
    let userRes;
    try {
      userRes = await axios.get(WP_OAUTH_ME, {
        headers: { Host: 'insuppent.com', Authorization: `Bearer ${access_token}` }
      });
      console.log('WP User Data:', userRes.data);
    } catch (userErr) {
      console.error('User info error:', userErr.response?.data || userErr.message);
      throw new Error('Failed to fetch user information from WordPress');
    }
    const wpUser = userRes.data;

    // Fetch WooCommerce Memberships for the user using API keys
    let memberships = [];
    try {
      const wcMembershipsRes = await axios.get(
        `${config.wpBaseUrl}/wp-json/wc/v2/memberships/members?customer=${wpUser.id || wpUser.ID}`,
        {
          auth: {
            username: config.woocommerce.consumerKey,
            password: config.woocommerce.consumerSecret
          }
        }
      );
      memberships = wcMembershipsRes.data;
      console.log('WooCommerce Memberships:', memberships);
    } catch (membershipErr) {
      console.error('Membership fetch error:', membershipErr.response?.data || membershipErr.message);
    }

    // Calculate token expiry
    const tokenExpiry = new Date(Date.now() + (expires_in * 1000));

    // Create user in DB if not exists
    try {
      await UserService.createUser({
        name: wpUser.display_name || wpUser.username || wpUser.email,
        email: wpUser.email,
        status: 'active',
        subscription: memberships && memberships.length > 0 ? memberships[0].plan_name : null,
      });
    } catch (err) {
      // Ignore duplicate email error, log others
      if (!String(err).includes('Email already exists')) {
        console.error('User DB create error:', err);
      }
    }

    // Store comprehensive user session
    req.session.user = {
      id: wpUser.id || wpUser.ID,
      username: wpUser.username,
      email: wpUser.email,
      firstName: wpUser.first_name || '',
      lastName: wpUser.last_name || '',
      displayName: wpUser.display_name || wpUser.username,
      memberships: memberships,
      accessToken: access_token,
      refreshToken: refresh_token,
      tokenExpiry: tokenExpiry,
      isAuthenticated: true,
      loginTime: new Date(),
      lastActivity: new Date()
    };
    // Clear OAuth state
    delete req.session.oauthState;

    // Save session and redirect
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.redirect(`${config.frontendUrl}/auth/login?error=session_error`);
      }

      res.redirect(config.frontendUrl);
    });

  } catch (err) {
    console.error('OAuth callback error:', err);
    const errorMessage = err.response?.data?.error_description || err.message;
    res.redirect(`${config.frontendUrl}/auth/login?error=${encodeURIComponent(errorMessage)}`);
  }
}

export function getUser(req, res) {
  if (!req.session.user || !req.session.user.isAuthenticated) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated',
      isAuthenticated: false
    });
  }

  // Update last activity
  req.session.user.lastActivity = new Date();

  // Return user data without sensitive tokens
  const { accessToken, refreshToken, ...userData } = req.session.user;

  res.json({
    success: true,
    data: userData,
    isAuthenticated: true
  });
}

export function logout(req, res) {
  const frontendUrl = config.frontendUrl || '/';

  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
    }
    res.clearCookie('sso.sid'); // Match the session name
    res.redirect(frontendUrl);
  });
}

// Check authentication status
export function checkAuth(req, res) {
  if (req.session.user && req.session.user.isAuthenticated) {
    // Update last activity
    req.session.user.lastActivity = new Date();

    const { accessToken, refreshToken, ...userData } = req.session.user;
    res.json({
      success: true,
      isAuthenticated: true,
      user: userData
    });
  } else {
    res.json({
      success: true,
      isAuthenticated: false,
      user: null
    });
  }
}

// Refresh token endpoint
export async function refreshToken(req, res) {
  if (!req.session.user || !req.session.user.refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'No refresh token available'
    });
  }

  try {
    const tokenRes = await axios.post(WP_OAUTH_TOKEN, new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: req.session.user.refreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token, refresh_token, expires_in } = tokenRes.data;

    // Update tokens in session
    req.session.user.accessToken = access_token;
    if (refresh_token) {
      req.session.user.refreshToken = refresh_token;
    }
    req.session.user.tokenExpiry = new Date(Date.now() + (expires_in * 1000));
    req.session.user.lastActivity = new Date();

    res.json({
      success: true,
      message: 'Token refreshed successfully'
    });

  } catch (err) {
    console.error('Token refresh error:', err);

    // If refresh fails, clear session
    req.session.destroy((destroyErr) => {
      if (destroyErr) console.error('Session destroy error:', destroyErr);
    });

    res.status(401).json({
      success: false,
      message: 'Token refresh failed. Please login again.'
    });
  }
}