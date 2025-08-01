import jwt from 'jsonwebtoken';
import { AppError } from '../utils/helpers.js';
import User from '../models/User.js';
import { STATUS_CODES } from '../utils/constants.js';

export const protect = async (req, res, next) => {
    try {
        // 1) Get token from header
        let token;
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            throw new AppError('You are not logged in. Please log in to get access.', STATUS_CODES.UNAUTHORIZED);
        }

        // 2) Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3) Check if user still exists
        const user = await User.findById(decoded.id);
        if (!user) {
            throw new AppError('The user belonging to this token no longer exists.', STATUS_CODES.UNAUTHORIZED);
        }

        // Grant access to protected route
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', STATUS_CODES.FORBIDDEN));
        }
        next();
    };
};