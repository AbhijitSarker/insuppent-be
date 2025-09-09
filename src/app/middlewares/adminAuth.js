import config from '../../config/index.js';
import ApiError from '../../errors/ApiError.js';
import { jwtHelpers } from '../../helpers/jwtHelpers.js';
import { Admin } from '../modules/admin/admin.model.js';

export const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new ApiError(401, 'You are not authorized');
    }

    // verify token
    const verifiedUser = jwtHelpers.verifyToken(token, config.jwt.admin_secret);

    // Find admin by id
    const admin = await Admin.findByPk(verifiedUser.id);
    if (!admin || admin.status !== 'active') {
      throw new ApiError(401, 'You are not authorized');
    }

    req.admin = verifiedUser;
    next();
  } catch (error) {
    next(error);
  }
};
