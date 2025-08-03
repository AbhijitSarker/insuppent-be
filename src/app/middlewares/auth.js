import httpStatus from 'http-status';
import config from '../../config/index.js';
import ApiError from '../../errors/ApiError.js';
import { jwtHelpers } from '../../helpers/jwtHelpers.js';

const auth = (...requiredRoles) => async (req, res, next) => {
  try {
    // Get authorization token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
    }

    // Extract the token
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    // Verify token
    let verifiedUser = null;
    verifiedUser = jwtHelpers.verifyToken(token, config.jwt.secret);

    req.user = verifiedUser;

    if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default auth;
