import { User } from './user.model.js';
import ApiError from '../../../errors/ApiError.js';
import httpStatus from 'http-status';

const updateUserStatus = async (id, status) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  user.status = status;
  await user.save();
  return user;
};

const createUser = async payload => {
  // Check if user with email already exists
  const existingUser = await User.findOne({
    where: { email: payload.email },
  });
  if (existingUser) {
    return existingUser;
  }
  // Only keep allowed fields
  const userData = {
    id: payload.id,
    name: payload.name,
    email: payload.email,
    subscription: payload.subscription,
    purchased: payload.purchased || 0,
    refunded: payload.refunded || 0,
    status: payload.status,
  };
  const result = await User.create(userData);
  return result;
};

const getAllUsers = async () => {
  const result = await User.findAll();
  return result;
};

const getUserById = async id => {
  const result = await User.findByPk(id);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return result;
};

const getUserByEmail = async email => {
  const user = await User.findOne({
    where: { email }
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return user;
};

export const UserService = {
  createUser,
  getAllUsers,
  getUserById,
  updateUserStatus,
  getUserByEmail,
};
