// app/modules/auth/auth.controller.js
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import config from '../../../config/index.js';
import { verifyToken, refreshUserData } from './auth.service.js';
import { UserService } from '../user/user.service.js';

const verifyWordPressAuth = catchAsync(async (req, res) => {
    const { uid, token } = req.query;

    if (!uid || !token) {
        return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: 'UID and token are required',
        });
    }

    // Verify with WordPress
    const verificationResult = await verifyToken(uid, token);

    if (!verificationResult.success) {
        return sendResponse(res, {
            statusCode: httpStatus.UNAUTHORIZED,
            success: false,
            message: verificationResult.message,
        });
    }

    // Try to create or update user in our database
    try {
        const wpUser = verificationResult.user;
        console.log('Verified WP User:', wpUser);

        const userCreateData = {
            userid: wpUser.userid,
            name: wpUser.name || wpUser.display_name,
            email: wpUser.email,
            subscription: wpUser.membership || 'Subscriber',
            status: 'Active',
            avatar: wpUser.avatar_url,
        };

        // Try to create user, if exists it will throw an error
        let dbUser = null;
        try {
            dbUser = await UserService.createUser(userCreateData);
            console.log('New user created:', dbUser);
        } catch (error) {
            if (error.statusCode === httpStatus.BAD_REQUEST && error.message === 'Email already exists') {
                // User exists, get their details
                const existingUser = await UserService.getUserByEmail(userCreateData.email);
                dbUser = existingUser;
                console.log('Existing user found:', dbUser);
            } else {
                throw error;
            }
        }

        // Create the session user data object
        const sessionUserData = {
            ...verificationResult.user,
            uid,
            token,
            authenticatedAt: new Date().toISOString(),
            dbUserId: dbUser.id
        };

        // Store in session
        req.session.user = sessionUserData;

        // Set secure httpOnly cookie with user data
        res.cookie('auth', JSON.stringify(sessionUserData), {
            httpOnly: true,
            secure: config.env === 'production',
            sameSite: config.env === 'production' ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            path: '/'
        });

        // Also set a non-httpOnly cookie for frontend access
        res.cookie('authStatus', 'true', {
            httpOnly: false,
            secure: config.env === 'production',
            sameSite: config.env === 'production' ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000,
            path: '/'
        });

        // Force session save
        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    reject(err);
                } else {
                    console.log('Session and cookies set successfully');
                    resolve();
                }
            });
        });

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Authentication successful',
            data: {
                user: verificationResult.user,
                sessionId: req.session.id,
            },
        });

    } catch (error) {
        console.error('Error creating/updating user:', error);
        return sendResponse(res, {
            statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: 'Error creating user account',
        });
    }
});

const getCurrentUser = catchAsync(async (req, res) => {
    // Use the user data that was already parsed and validated by the auth middleware
    if (!req.user) {
        return sendResponse(res, {
            statusCode: httpStatus.UNAUTHORIZED,
            success: false,
            message: 'Not authenticated',
        });
    }

    return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: {
            user: req.user,
            isAuthenticated: true,
        },
    });
});

const logout = catchAsync(async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return sendResponse(res, {
                statusCode: httpStatus.INTERNAL_SERVER_ERROR,
                success: false,
                message: 'Failed to logout',
            });
        }

        // Clear all auth-related cookies
        res.clearCookie('connect.sid');
        res.clearCookie('auth');
        res.clearCookie('authStatus');

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Logged out successfully',
        });
    });
});

const refreshAuth = catchAsync(async (req, res) => {
    if (!req.session.user) {
        return sendResponse(res, {
            statusCode: httpStatus.UNAUTHORIZED,
            success: false,
            message: 'Not authenticated',
        });
    }

    const { uid, token } = req.session.user;
    const verificationResult = await verifyToken(uid, token);

    if (!verificationResult.success) {
        // Clear invalid session
        req.session.destroy(() => { });
        return sendResponse(res, {
            statusCode: httpStatus.UNAUTHORIZED,
            success: false,
            message: 'Session expired or invalid',
        });
    }

    // Update session with fresh data
    req.session.user = {
        ...verificationResult.user,
        uid,
        token,
        authenticatedAt: new Date().toISOString(),
    };

    await new Promise((resolve, reject) => {
        req.session.save((err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: {
            user: verificationResult.user,
        },
    });
});

export {
    verifyWordPressAuth,
    getCurrentUser,
    logout,
    refreshAuth,
};