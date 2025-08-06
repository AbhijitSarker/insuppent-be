import httpStatus from 'http-status';
import ApiError from '../../errors/ApiError.js';
import { jwtHelpers } from '../../helpers/jwtHelpers.js';
import config from '../../config/index.js';

const auth = (...requiredRoles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
      }

      // Remove Bearer from token
      const accessToken = token.startsWith('Bearer ')
        ? token.slice(7)
        : token;

      const verifiedUser = jwtHelpers.verifyToken(accessToken, config.jwt.secret);

      req.user = verifiedUser;

      if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
