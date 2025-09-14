import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import { User } from '../modules/user/user.model.js';
import ApiError from '../../errors/ApiError.js';
import config from '../../config/index.js';

const userAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        console.log('Received token:', token);
        if (!token) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'Access denied. No token provided.');
        }

        // Verify the JWT token
        const decoded = jwt.verify(token, config.jwt.user_secret);
        console.log('Decoded token:', decoded);
        // Find user in database
        const user = await User.findByPk(decoded.userid);
        console.log('Found user:', user);
        if (!user) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token. User not found.');
        }

        // // Check if user is active
        // if (user.status !== 'active') {
        //     throw new ApiError(httpStatus.FORBIDDEN, 'User account is not active.');
        // }

        // Add user to request object
        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            subscription: user.subscription,
            role: user.role || [],
        };
        console.log('Authenticated user:', req.user);
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return next(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token.'));
        }
        if (error.name === 'TokenExpiredError') {
            return next(new ApiError(httpStatus.UNAUTHORIZED, 'Token expired.'));
        }
        next(error);
    }
};

export default userAuth;