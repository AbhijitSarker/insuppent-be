// app/modules/auth/auth.controller.js
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
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
        const userData = {
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
            dbUser = await UserService.createUser(userData);
            console.log('New user created:', dbUser);
        } catch (error) {
            if (error.statusCode === httpStatus.BAD_REQUEST && error.message === 'Email already exists') {
                // User exists, get their details
                const existingUser = await UserService.getUserByEmail(userData.email);
                dbUser = existingUser;
                console.log('Existing user found:', dbUser);
            } else {
                throw error;
            }
        }

        // Store user data in session
        req.session.user = {
            ...verificationResult.user,
            uid,
            token,
            authenticatedAt: new Date().toISOString(),
            dbUserId: dbUser.id // Store our database user ID in the session
        };

        // Save session
        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    } catch (error) {
        console.error('Error creating/updating user:', error);
        return sendResponse(res, {
            statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: 'Error creating user account',
        });
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Authentication successful',
        data: {
            user: verificationResult.user,
            sessionId: req.session.id,
        },
    });
});

const getCurrentUser = catchAsync(async (req, res) => {
    if (!req.session.user) {
        return sendResponse(res, {
            statusCode: httpStatus.UNAUTHORIZED,
            success: false,
            message: 'Not authenticated',
        });
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: {
            user: req.session.user,
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

        res.clearCookie('connect.sid'); // Clear session cookie
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