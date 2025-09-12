import httpStatus from 'http-status';
import sendResponse from '../../shared/sendResponse.js';
import { jwtHelpers } from '../../helpers/jwtHelpers.js';
import config from '../../config/index.js';
import { sessionStore } from '../../utils/sessionStore.js';

export const requireAuth = async (req, res, next) => {
    try {
        // Get tokens and session ID from cookies
        const accessToken = req.cookies.accessToken;
        console.log("🚀 ~ requireAuth ~ accessToken:", accessToken)
        const sessionId = req.cookies.sessionId;
        console.log("🚀 ~ requireAuth ~ sessionId:", sessionId)
        clg("🚀 ~ requireAuth ~ req.cookies:", req.cookies)

        if (!accessToken && !sessionId) {
            return sendResponse(res, {
                statusCode: httpStatus.UNAUTHORIZED,
                success: false,
                message: 'Authentication required. Please login through WordPress.',
            });
        }

        let user = null;

        // Try JWT token first
        if (accessToken) {
            try {
                const decodedToken = jwtHelpers.verifyToken(accessToken, config.jwt.secret);
                
                // Validate user object structure
                if (decodedToken && decodedToken.id && decodedToken.role) {
                    user = decodedToken;
                    console.log('Authentication successful via JWT:', decodedToken.email);
                }
            } catch (tokenError) {
                console.log('JWT verification failed, trying Redis session:', tokenError.message);
            }
        }

        // If JWT fails or doesn't exist, try Redis session
        if (!user && sessionId) {
            try {
                const sessionData = await sessionStore.getUserSession(sessionId);
                if (sessionData && sessionData.id && sessionData.role) {
                    user = sessionData;
                    console.log('Authentication successful via Redis session:', sessionData.email);
                } else {
                    console.log('No valid session found in Redis for sessionId:', sessionId);
                }
            } catch (sessionError) {
                console.error('Redis session verification failed:', sessionError);
            }
        }

        if (!user) {
            return sendResponse(res, {
                statusCode: httpStatus.UNAUTHORIZED,
                success: false,
                message: 'Invalid or expired authentication',
            });
        }

        req.user = user;
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
export const optionalAuth = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        const sessionId = req.cookies.sessionId;
        
        let user = null;

        // Try JWT token first
        if (accessToken) {
            try {
                const decodedToken = jwtHelpers.verifyToken(accessToken, config.jwt.secret);
                if (decodedToken && decodedToken.id) {
                    user = decodedToken;
                }
            } catch (tokenError) {
                console.error('JWT verification failed in optional auth:', tokenError);
            }
        }

        // If JWT fails, try Redis session
        if (!user && sessionId) {
            try {
                const sessionData = await sessionStore.getUserSession(sessionId);
                if (sessionData && sessionData.id) {
                    user = sessionData;
                }
            } catch (sessionError) {
                console.error('Redis session verification failed in optional auth:', sessionError);
            }
        }

        if (user) {
            req.user = user;
        }
        
        next();
    } catch (error) {
        console.error('Optional auth error:', error);
        next();
    }
};