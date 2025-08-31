import httpStatus from 'http-status';
import { Admin } from './admin.model.js';
import ApiError from '../../../errors/ApiError.js';
import { jwtHelpers } from '../../../helpers/jwtHelpers.js';
import config from '../../../config/index.js';
import { LeadUser } from '../purchase/leadUser.model.js';

const createAdmin = async payload => {
  // Check if admin with email already exists
  const existingAdmin = await Admin.findOne({
    where: { email: payload.email },
  });
  if (existingAdmin) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already exists');
  }

  const result = await Admin.create(payload);
  return result;
};

const loginAdmin = async payload => {
  const { email, password } = payload;

  const admin = await Admin.scope(null).findOne({
    where: { email },
    attributes: { include: ['password'] },
  });
  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
  }

  if (admin.status === 'inactive') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Admin account is inactive');
  }

  const isPasswordMatched = await admin.isPasswordMatched(password);
  if (!isPasswordMatched) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
  }

  // Create access token
  const accessToken = jwtHelpers.createToken(
    {
      id: admin.id,
      role: admin.role,
    },
    config.jwt.secret,
    config.jwt.expires_in,
  );

  // Create refresh token
  const refreshToken = jwtHelpers.createToken(
    {
      id: admin.id,
      role: admin.role,
    },
    config.jwt.refresh_secret,
    config.jwt.refresh_expires_in,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async token => {
  let verifiedToken = null;
  try {
    verifiedToken = jwtHelpers.verifyToken(token, config.jwt.refresh_secret);
  } catch (err) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token');
  }

  const admin = await Admin.findByPk(verifiedToken.id);
  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
  }

  if (admin.status === 'inactive') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Admin account is inactive');
  }

  const newAccessToken = jwtHelpers.createToken(
    {
      id: admin._id,
      role: admin.role,
    },
    config.jwt.secret,
    config.jwt.expires_in,
  );

  return {
    accessToken: newAccessToken,
  };
};

const getAdminProfile = async id => {
  const result = await Admin.findByPk(id);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
  }
  return result;
};

const updateAdminProfile = async (id, payload) => {
  const admin = await Admin.findByPk(id);
  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
  }

  if (payload.email && payload.email !== admin.email) {
    const existingAdmin = await Admin.findOne({
      where: { email: payload.email },
    });
    if (existingAdmin) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email already exists');
    }
  }

  await Admin.update(payload, { where: { id } });
  const result = await Admin.findByPk(id);
  return result;
};

export async function markLeadUserRefunded(leadUserId, isRefunded) {
  const leadUser = await LeadUser.findByPk(leadUserId);
  if (!leadUser) throw new ApiError(404, 'LeadUser not found');
  // Only update if value is different
  // if (leadUser.isRefunded !== isRefunded) {
    leadUser.isRefunded = !leadUser.isRefunded;
    await leadUser.save();
  // }
  return leadUser;
}

export const AdminService = {
  createAdmin,
  loginAdmin,
  refreshToken,
  getAdminProfile,
  updateAdminProfile,
};
