import { STATUS_CODES } from '../utils/constants.js';
import config from '../config/config.js';

const handleCastErrorDB = err => ({
    message: `Invalid ${err.path}: ${err.value}`,
    statusCode: STATUS_CODES.BAD_REQUEST
});

const handleDuplicateFieldsDB = err => ({
    message: `Duplicate field value: ${Object.keys(err.keyValue).join(', ')}. Please use another value`,
    statusCode: STATUS_CODES.BAD_REQUEST
});

const handleValidationErrorDB = err => ({
    message: Object.values(err.errors).map(el => el.message).join('. '),
    statusCode: STATUS_CODES.BAD_REQUEST
});

const handleJWTError = () => ({
    message: 'Invalid token. Please log in again',
    statusCode: STATUS_CODES.UNAUTHORIZED
});

const handleJWTExpiredError = () => ({
    message: 'Your token has expired. Please log in again',
    statusCode: STATUS_CODES.UNAUTHORIZED
});

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || STATUS_CODES.INTERNAL_SERVER;

    // Operational, trusted error: send message to client
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }

    // Programming or other unknown error: don't leak error details
    if (config.app.env === 'development') {
        return res.status(err.statusCode).json({
            status: 'error',
            error: err,
            message: err.message,
            stack: err.stack
        });
    }

    // Specific error handlers
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    // Send generic message in production
    return res.status(error.statusCode).json({
        status: 'error',
        message: error.message || 'Something went wrong!'
    });
};

export default errorHandler;