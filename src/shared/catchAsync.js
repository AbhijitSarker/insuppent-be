/**
 * Utility function to handle asynchronous request handlers
 * @param {Function} fn - The async function to wrap
 * @returns {Function} Express middleware function
 */
const catchAsync = fn => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    next(error);
  }
};

export default catchAsync;
