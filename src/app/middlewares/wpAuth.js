import httpStatus from 'http-status';
import sendResponse from '../../shared/sendResponse.js';

import { jwtHelpers } from '../../helpers/jwtHelpers.js';
import config from '../../config/index.js';

export const requireAuth = (req, res, next) => {
    try {
        // Get the access token from cookies
        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            return sendResponse(res, {
                statusCode: httpStatus.UNAUTHORIZED,
                success: false,
                message: 'Authentication required. Please login through WordPress.',
            });
        }

        try {
            // Verify the JWT token
            const decodedToken = jwtHelpers.verifyToken(accessToken, config.jwt.secret);
            req.user = decodedToken;
            console.log('Decoded token:', decodedToken);
            // Validate user object structure
            if (!req.user || !req.user.id || !req.user.role) {
                return sendResponse(res, {
                    statusCode: httpStatus.UNAUTHORIZED,
                    success: false,
                    message: 'Invalid authentication data',
                });
            }
        } catch (tokenError) {
            // Token verification failed
            return sendResponse(res, {
                statusCode: httpStatus.UNAUTHORIZED,
                success: false,
                message: 'Invalid or expired token',
            });
        }

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return sendResponse(res, {
            statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: 'Error processing authentication',
            error: error.message
        });
    }
};

// Role-based authorization
export const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return sendResponse(res, {
                statusCode: httpStatus.UNAUTHORIZED,
                success: false,
                message: 'Authentication required',
            });
        }

        const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];
        const hasRequiredRole = roles.some(role => userRoles.includes(role));

        if (!hasRequiredRole) {
            return sendResponse(res, {
                statusCode: httpStatus.FORBIDDEN,
                success: false,
                message: 'Insufficient permissions',
            });
        }

        next();
    };
};

// Admin role check
export const requireAdmin = requireRole(['administrator', 'bbp_keymaster']);

// Optional auth - adds user to request if authenticated, but doesn't require it
export const optionalAuth = (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        if (accessToken) {
            try {
                const decodedToken = jwtHelpers.verifyToken(accessToken, config.jwt.secret);
                req.user = decodedToken;
            } catch (tokenError) {
                console.error('Token verification failed in optional auth:', tokenError);
            }
        }
        next();
    } catch (error) {
        console.error('Optional auth error:', error);
        next();
    }
};