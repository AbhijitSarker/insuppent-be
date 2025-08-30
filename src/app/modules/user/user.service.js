const updateUserStatus = async (id, status) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  user.status = status;
  await user.save();
  return user;
};
import { User } from './user.model.js';
import ApiError from '../../../errors/ApiError.js';
import httpStatus from 'http-status';

const createUser = async payload => {
  console.log('Creating user with payload:', payload);
  // Check if user with email already exists
  const existingUser = await User.findOne({
    where: { email: payload.email },
  });
  if (existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already exists');
  }
  // Only keep allowed fields
  const userData = {
    name: payload.name,
    email: payload.email,
    subscription: payload.subscription,
    purchased: payload.purchased || 0,
    refunded: payload.refunded || 0,
    status: payload.status,
  };
  console.log('Creating user with data:', userData);
  const result = await User.create(userData);
  console.log('Created user:', result);
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
  updateUserStatus,
};
