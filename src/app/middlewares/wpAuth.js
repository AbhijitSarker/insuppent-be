// app/middlewares/auth.js
import httpStatus from 'http-status';
import sendResponse from '../utils/sendResponse.js';

// Basic authentication check
export const requireAuth = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return sendResponse(res, {
            statusCode: httpStatus.UNAUTHORIZED,
            success: false,
            message: 'Authentication required. Please login through WordPress.',
        });
    }

    // Check if session is too old (optional - 24 hours)
    const sessionAge = new Date() - new Date(req.session.user.authenticatedAt);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (sessionAge > maxAge) {
        req.session.destroy(() => { });
        return sendResponse(res, {
            statusCode: httpStatus.UNAUTHORIZED,
            success: false,
            message: 'Session expired. Please login again.',
        });
    }

    // Add user to request object for easy access
    req.user = req.session.user;
    next();
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

        const userRoles = req.user.role || [];
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
export const requireAdmin = requireRole(['administrator']);

// Optional auth - adds user to request if authenticated, but doesn't require it
export const optionalAuth = (req, res, next) => {
    if (req.session && req.session.user) {
        req.user = req.session.user;
    }
    next();
};