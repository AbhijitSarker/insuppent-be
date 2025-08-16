import { User } from './user.model.js';
import ApiError from '../../../errors/ApiError.js';
import httpStatus from 'http-status';

const createUser = async payload => {
  // Check if user with email already exists
  const existingUser = await User.findOne({
    where: { email: payload.email },
  });
  if (existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already exists');
  }
  const result = await User.create(payload);
  return result;
};

const getAllUsers = async () => {
  const result = await User.findAll();
  return result;
};

const getSingleUser = async id => {
  const result = await User.findByPk(id);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return result;
};

export const UserService = {
  createUser,
  getAllUsers,
  getSingleUser,
};
