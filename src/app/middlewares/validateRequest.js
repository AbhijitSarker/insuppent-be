// Middleware to validate requests using a Zod schema
const validateRequest = (schema) => async (req, res, next) => {
  try {
    // Validate request data (body, query, params, cookies)
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
      cookies: req.cookies,
    });
    return next(); // Proceed if validation passes
  } catch (error) {
    next(error); // Pass validation errors to error handler
  }
};

export default validateRequest;
