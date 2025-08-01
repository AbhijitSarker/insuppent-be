import User from '../models/User.js';
import { AppError } from '../utils/helpers.js';
import { STATUS_CODES } from '../utils/constants.js';

export const updateProfile = async (userId, updateData) => {
    const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
        throw new AppError('User not found', STATUS_CODES.NOT_FOUND);
    }

    return user;
};

export const updatePassword = async (userId, currentPassword, newPassword) => {
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
        throw new AppError('User not found', STATUS_CODES.NOT_FOUND);
    }

    if (!(await user.comparePassword(currentPassword))) {
        throw new AppError('Current password is incorrect', STATUS_CODES.UNAUTHORIZED);
    }

    user.password = newPassword;
    await user.save();

    return { message: 'Password updated successfully' };
};

export const getProfile = async (userId) => {
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
        throw new AppError('User not found', STATUS_CODES.NOT_FOUND);
    }

    return user;
};