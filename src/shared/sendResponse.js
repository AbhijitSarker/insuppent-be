/**
 * Function to send a standardized API response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data object containing statusCode, success, message, meta, and data
 */
const sendResponse = (res, data) => {
  // Build the response structure
  const responseData = {
    statusCode: data.statusCode,
    success: data.success,
    message: data.message || null,
    meta: data.meta || null,
    data: data.data || null,
  };

  // Send the response with the specified status code and JSON data
  res.status(data.statusCode).json(responseData);
};

export default sendResponse;
