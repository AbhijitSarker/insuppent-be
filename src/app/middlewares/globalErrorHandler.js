import config from '../../config/index.js';
import ApiError from '../../errors/ApiError.js';
import handleValidationError from '../../errors/handleValidationError.js';
import { ZodError } from 'zod';
import handleZodError from '../../errors/handleZodError.js';
import handleCastError from '../../errors/handleCastError.js';

const globalErrorHandler = (error, req, res, next) => {
  // Log the error
  config.env === 'development'
    ? console.log('🐱‍🏍 globalErrorHandler ~~', error)
    : console.error(error);

  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorMessages = [];

  // Handle Mongoose validation errors
  if (error?.name === 'ValidationError') {
    const simplifiedError = handleValidationError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorMessages = simplifiedError.errorMessages;
  }
  // Handle Zod validation errors
  else if (error instanceof ZodError) {
    const simplifiedError = handleZodError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorMessages = simplifiedError.errorMessages;
  }
  // Handle Mongoose Cast Error
  else if (error?.name === 'CastError') {
    const simplifiedError = handleCastError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorMessages = simplifiedError.errorMessages;
  }
  // Handle custom API errors
  else if (error instanceof ApiError) {
    statusCode = error?.statusCode;
    message = error.message;
    errorMessages = error?.message
      ? [
          {
            path: '',
            message: error?.message,
          },
        ]
      : [];
  }
  // Handle general errors
  else if (error instanceof Error) {
    message = error?.message;
    errorMessages = error?.message
      ? [
          {
            path: '',
            message: error?.message,
          },
        ]
      : [];
  }

  // Respond with error details
  res.status(statusCode).json({
    success: false,
    message,
    errorMessages,
    stack: config.env !== 'production' ? error?.stack : undefined,
  });
};

export default globalErrorHandler;
