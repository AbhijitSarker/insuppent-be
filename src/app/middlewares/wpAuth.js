import httpStatus from 'http-status';
import sendResponse from '../../shared/sendResponse.js';

export const requireAuth = (req, res, next) => {
    try {
        // Check both session and cookie for user data
        const user = req.session.user || req.cookies.auth;

        if (!user) {
            return sendResponse(res, {
                statusCode: httpStatus.UNAUTHORIZED,
                success: false,
                message: 'Authentication required. Please login through WordPress.',
            });
        }

        // Parse user data if it's from cookie
        req.user = typeof user === 'string' ? JSON.parse(user) : user;

        // Validate user object structure
        if (!req.user || !req.user.userid || !req.user.role) {
            return sendResponse(res, {
                statusCode: httpStatus.UNAUTHORIZED,
                success: false,
                message: 'Invalid authentication data',
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
        const user = req.session.user || req.cookies.auth;
        if (user) {
            req.user = typeof user === 'string' ? JSON.parse(user) : user;
        }
        next();
    } catch (error) {
        console.error('Optional auth error:', error);
        next();
    }
};