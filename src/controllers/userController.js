import * as userService from '../services/userService.js';
import { asyncHandler, filterObj } from '../utils/helpers.js';

export const getProfile = asyncHandler(async (req, res) => {
    const user = await userService.getProfile(req.user._id);
    res.status(200).json({
        status: 'success',
        data: user
    });
});

export const updateProfile = asyncHandler(async (req, res) => {
    // Only allow name and email to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');
    const updatedUser = await userService.updateProfile(req.user._id, filteredBody);

    res.status(200).json({
        status: 'success',
        data: updatedUser
    });
});

export const updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    await userService.updatePassword(req.user._id, currentPassword, newPassword);
    
    res.status(200).json({
        status: 'success',
        message: 'Password updated successfully'
    });
});