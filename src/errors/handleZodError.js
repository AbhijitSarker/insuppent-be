// Handle Zod validation errors
const handleZodError = (error) => {
  // Map Zod issues to a list of error messages
  const errors = error.issues.map((issue) => {
    return {
      path: issue?.path[issue.path.length - 1], // Extract the field causing the error
      message: issue?.message, // Include the error message
    };
  });

  const statusCode = 400; // Set the status code for validation errors

  return {
    statusCode,
    message: 'Validation Error',
    errorMessages: errors,
  };
};

export default handleZodError;
