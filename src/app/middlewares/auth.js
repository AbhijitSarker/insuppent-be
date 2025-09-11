// app/middlewares/auth.js
import httpStatus from 'http-status';
import { jwtHelpers } from '../../helpers/jwtHelpers.js';
import config from '../../config/index.js';

// Middleware to check if user is authenticated
export const requireAuth = (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    
    if (!accessToken) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication required',
        errorMessages: [
          {
            path: req.originalUrl,
            message: 'Please login to access this resource',
          },
        ],
      });
    }

    const decoded = jwtHelpers.verifyToken(accessToken, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid or expired token',
      errorMessages: [
        {
          path: req.originalUrl,
          message: 'Please login again',
        },
      ],
    });
  }
};

// Middleware to check if user has specific roles
export const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication required',
        errorMessages: [
          {
            path: req.originalUrl,
            message: 'Please login to access this resource',
          },
        ],
      });
    }

    const userRoles = req.session.user.roles || [];
    const hasRole = roles.some(role => userRoles.includes(role));

    if (!hasRole) {
      return res.status(httpStatus.FORBIDDEN).json({
        success: false,
        message: 'Insufficient permissions',
        errorMessages: [
          {
            path: req.originalUrl,
            message: `Required roles: ${roles.join(', ')}`,
          },
        ],
      });
    }

    next();
  };
};

// Middleware to check if user is admin
export const requireAdmin = requireRole(['admin', 'administrator']);

// Middleware to attach user to request (optional, doesn't require auth)
export const attachUser = (req, res, next) => {
  if (req.session.user && req.session.user.isAuthenticated) {
    req.user = req.session.user;
  }
  next();
};