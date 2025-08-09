import httpStatus from 'http-status';

// Handle Zod validation errors
const handleZodError = error => {
  // Map Zod issues to a list of error messages
  const errors = error.errors.map(error => {
    return {
      path: error.path[error.path.length - 1], // Extract the field causing the error
      message: error.message, // Include the error message
    };
  });

  const statusCode = httpStatus.BAD_REQUEST; // Set the status code for validation errors

  return {
    statusCode,
    message: 'Validation Error',
    errorMessages: errors,
  };
};

export default handleZodError;
