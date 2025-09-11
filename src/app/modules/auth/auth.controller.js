// app/modules/auth/auth.controller.js
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import config from '../../../config/index.js';
import { verifyToken, refreshUserData } from './auth.service.js';
import { UserService } from '../user/user.service.js';
import { jwtHelpers } from '../../../helpers/jwtHelpers.js';

const checkAuth = catchAsync(async (req, res) => {
    console.log('Checking authentication status... request cookies:', req.cookies);
    try {
        // First check for access token as it's our primary auth mechanism
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            console.log('No access token found');
            return sendResponse(res, {
                statusCode: httpStatus.UNAUTHORIZED,
                success: false,
                message: 'Not authenticated'
            });
        }

        // Check for authStatus cookie (non-httpOnly) as secondary validation
        const authStatus = req.cookies.authStatus;
        if (!authStatus) {
            console.log('No auth status cookie');
            // Don't return here, just log it as the JWT is more important
        }

        // Verify the token
        const decoded = jwtHelpers.verifyToken(accessToken, config.jwt.secret);
        
        // Get fresh user data from database
        const user = await UserService.getUserById(decoded.id);
        
        if (!user) {
            return sendResponse(res, {
                statusCode: httpStatus.UNAUTHORIZED,
                success: false,
                message: 'User not found'
            });
        }

        return sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'User is authenticated',
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                subscription: user.subscription,
                status: user.status,
                purchased: user.purchased,
                refunded: user.refunded,
                role: decoded.role
            }
        });
    } catch (error) {
        console.error('Auth check error:', error);
        return sendResponse(res, {
            statusCode: httpStatus.UNAUTHORIZED,
            success: false,
            message: 'Invalid or expired token'
        });
    }
});

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

        // Create tokens and user data
        const userData = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            subscription: dbUser.subscription,
            status: dbUser.status,
            purchased: dbUser.purchased,
            refunded: dbUser.refunded,
            role: verificationResult.user.role,
            wpUserId: uid
        };

        // Create access token
        const accessToken = jwtHelpers.createToken(
            { ...userData },
            config.jwt.secret,
            config.jwt.expires_in
        );

        // Create refresh token
        const refreshToken = jwtHelpers.createToken(
            { id: dbUser.id },
            config.jwt.refresh_secret,
            config.jwt.refresh_expires_in
        );

        // Set cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: config.env === 'production',
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: config.env === 'production',
            sameSite: 'none',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        // Set a non-httpOnly cookie for frontend auth status check
        res.cookie('authStatus', 'true', {
            httpOnly: false,
            secure: config.env === 'production',
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000
        });

        return sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'User logged in successfully',
            data: userData
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
    try {
        // Clear all auth-related cookies with the same settings they were set with
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: config.env === 'production',
            sameSite: 'none'
        });
        
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: config.env === 'production',
            sameSite: 'none'
        });
        
        res.clearCookie('authStatus', {
            httpOnly: false,
            secure: config.env === 'production',
            sameSite: 'none'
        });

        return sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        return sendResponse(res, {
            statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: 'Failed to logout'
        });
    }
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
    checkAuth,
};