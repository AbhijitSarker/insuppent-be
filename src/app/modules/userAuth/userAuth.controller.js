import jwt from 'jsonwebtoken';
import axios from 'axios';
import catchAsync from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import config from '../../../config/index.js';
import ApiError from '../../../errors/ApiError.js';
import { UserService } from '../user/user.service.js';
import { User } from '../user/user.model.js';

// Verify WordPress token and authenticate user
const verifyWpUser = catchAsync(async (req, res) => {
    const { uid, token } = req.body;

    if (!uid || !token) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'User ID and token are required');
    }

    try {
        // Verify with WordPress
        const wpVerifyUrl = `${config.wordpress.site_url}/wp-json/wprsb/v1/verify`;

        const wpResponse = await axios.get(wpVerifyUrl, {
            params: { uid, token },
            timeout: 10000 // 10 second timeout
        });
        if (!wpResponse.data.valid) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid WordPress token');
        }

        const wpUser = wpResponse.data.user;

        // Check if user exists in our database, create if not
        let user;
        try {
            user = await UserService.getUserById(wpUser.userid);
        } catch (error) {
            // User doesn't exist, create new one
            const userData = {
                id: wpUser.userid,
                name: wpUser.name,
                email: wpUser.email,
                subscription: wpUser.membership || 'Subscriber',
                role: wpUser.role || [],
                status: 'active',
                purchased: 0,
                refunded: 0,
            };
            user = await UserService.createUser(userData);
        }
        // Update user info if it exists (in case of changes in WordPress)
        if (user.name !== wpUser.name || user.email !== wpUser.email) {
            user.name = wpUser.name;
            user.email = wpUser.email;
            user.subscription = wpUser.membership || user.subscription;
            user.role = wpUser.role || user.role;
            await user.save();
        }

        // Generate our own JWT token for subsequent requests
        const jwtPayload = {
            userid: user.id,
            name: user.name,
            email: user.email,
            subscription: user.subscription,
            role: user.role,
        };

        const jwtToken = jwt.sign(
            jwtPayload,
            config.jwt.user_secret,
            { expiresIn: config.jwt.user_expires_in || '7d' }
        );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'User authenticated successfully',
            data: {
                user: jwtPayload,
                token: jwtToken,
            },
        });
    } catch (error) {
        console.error('WordPress verification failed:', error.message);

        // Handle different types of errors
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'WordPress site is not reachable');
        }

        if (error.response?.status === 401 || error.response?.status === 403) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid WordPress credentials');
        }

        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to verify WordPress user'
        );
    }
});

// Get current user profile
const getUserProfile = catchAsync(async (req, res) => {
    const user = await UserService.getUserById(req.user.userid);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User profile retrieved successfully',
        data: {
            userid: user.id,
            name: user.name,
            email: user.email,
            subscription: user.subscription,
            role: user.role || [],
            purchased: user.purchased,
            refunded: user.refunded,
            status: user.status,
        },
    });
});

// Refresh user token
const refreshToken = catchAsync(async (req, res) => {
    const user = await UserService.getUserById(req.user.userid);

    const jwtPayload = {
        userid: user.id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
        role: user.role,
    };

    const jwtToken = jwt.sign(
        jwtPayload,
        config.jwt.user_secret,
        { expiresIn: config.jwt.user_expires_in || '7d' }
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Token refreshed successfully',
        data: {
            user: jwtPayload,
            token: jwtToken,
        },
    });
});

export const UserAuthController = {
    verifyWpUser,
    getUserProfile,
    refreshToken,
};