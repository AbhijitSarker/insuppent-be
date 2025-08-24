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

  const url = `${WP_OAUTH_AUTHORIZE}?response_type=code&client_id=${encodeURIComponent(CLIENT_ID)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&scope=profile email`;
  res.redirect(url);
}

export async function callback(req, res) {
  const { code, state } = req.query;
  console.log(`SSO callback state: ${state}, session state: ${req.session.oauthState}`);

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
        headers: { Authorization: `Bearer ${access_token}` }
      });
      console.log('WP User Data:', userRes.data);
    } catch (userErr) {
      console.error('User info error:', userErr.response?.data || userErr.message);
      throw new Error('Failed to fetch user information from WordPress');
    }

    const wpUser = userRes.data;

    // Get user roles (fix for undefined roles)
    let userRoles = [];
    if (wpUser.roles && Array.isArray(wpUser.roles)) {
      userRoles = wpUser.roles;
    } else if (wpUser.roles && typeof wpUser.roles === 'object') {
      userRoles = Object.values(wpUser.roles);
    } else {
      // Default role if no roles found
      userRoles = ['subscriber'];
    }

    const mappedRoles = mapRoles(userRoles);

    // Calculate token expiry
    const tokenExpiry = new Date(Date.now() + (expires_in * 1000));

    // Store comprehensive user session
    req.session.user = {
      id: wpUser.id || wpUser.ID,
      username: wpUser.username,
      email: wpUser.email,
      firstName: wpUser.first_name || '',
      lastName: wpUser.last_name || '',
      displayName: wpUser.display_name || wpUser.username,
      roles: mappedRoles,
      wpRoles: userRoles,
      accessToken: access_token,
      refreshToken: refresh_token,
      tokenExpiry: tokenExpiry,
      isAuthenticated: true,
      loginTime: new Date(),
      lastActivity: new Date()
    };

    // Clear OAuth state
    delete req.session.oauthState;

    console.log('Session user saved:', {
      id: req.session.user.id,
      username: req.session.user.username,
      roles: req.session.user.roles
    });

    // Save session and redirect
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.redirect(`${config.frontendUrl}/auth/login?error=session_error`);
      }

      // Redirect based on user role
      const redirectUrl = mappedRoles.includes('admin')
        ? `${config.frontendUrl}/admin`
        : `${config.frontendUrl}/`;

      res.redirect(redirectUrl);
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

// // Check authentication status
// export function checkAuth(req, res) {
//   if (req.session.user && req.session.user.isAuthenticated) {
//     // Update last activity
//     req.session.user.lastActivity = new Date();

//     const { accessToken, refreshToken, ...userData } = req.session.user;
//     res.json({
//       success: true,
//       isAuthenticated: true,
//       user: userData
//     });
//   } else {
//     res.json({
//       success: true,
//       isAuthenticated: false,
//       user: null
//     });
//   }
// }



export function checkAuth(req, res) {
  // Comprehensive debugging information
  const debugInfo = {
    timestamp: new Date().toISOString(),
    sessionID: req.sessionID,
    hasSession: !!req.session,
    sessionKeys: req.session ? Object.keys(req.session) : [],
    hasUser: !!req.session?.user,
    userKeys: req.session?.user ? Object.keys(req.session.user) : [],
    isAuthenticated: req.session?.user?.isAuthenticated,
    userId: req.session?.user?.id,
    username: req.session?.user?.username,
    cookies: req.headers.cookie ? req.headers.cookie.split('; ') : [],
    userAgent: req.headers['user-agent'],
    origin: req.headers.origin,
    referer: req.headers.referer,
    xForwardedFor: req.headers['x-forwarded-for'],
    remoteAddress: req.connection.remoteAddress,
    ip: req.ip,
    secure: req.secure,
    protocol: req.protocol
  };

  console.log('CheckAuth Debug Info:', JSON.stringify(debugInfo, null, 2));

  // Check if session exists
  if (!req.session) {
    console.error('❌ No session object found');
    return res.json({
      success: false,
      isAuthenticated: false,
      user: null,
      error: 'No session found',
      debug: debugInfo
    });
  }

  // Check if user exists in session
  if (!req.session.user) {
    console.log('❌ No user in session');
    return res.json({
      success: true,
      isAuthenticated: false,
      user: null,
      message: 'No user in session',
      debug: debugInfo
    });
  }

  // Check if user is authenticated
  if (!req.session.user.isAuthenticated) {
    console.log('❌ User exists but not authenticated');
    return res.json({
      success: true,
      isAuthenticated: false,
      user: null,
      message: 'User not authenticated',
      debug: debugInfo
    });
  }

  // Check if user data is complete
  if (!req.session.user.id || !req.session.user.username) {
    console.error('❌ Incomplete user data in session');
    return res.json({
      success: false,
      isAuthenticated: false,
      user: null,
      error: 'Incomplete user data',
      debug: debugInfo
    });
  }

  // All checks passed - user is authenticated
  console.log('✅ User is authenticated:', {
    id: req.session.user.id,
    username: req.session.user.username,
    roles: req.session.user.roles
  });

  try {
    // Update last activity
    req.session.user.lastActivity = new Date();

    // Remove sensitive data
    const { accessToken, refreshToken, ...userData } = req.session.user;

    // Force save session to ensure persistence
    req.session.save((err) => {
      if (err) {
        console.error('Session save error in checkAuth:', err);
      }
    });

    return res.json({
      success: true,
      isAuthenticated: true,
      user: userData,
      debug: process.env.NODE_ENV === 'development' ? debugInfo : undefined
    });

  } catch (error) {
    console.error('Error in checkAuth:', error);
    return res.status(500).json({
      success: false,
      isAuthenticated: false,
      user: null,
      error: 'Internal server error',
      debug: debugInfo
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