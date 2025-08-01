import * as authService from '../services/authService.js';
import { asyncHandler } from '../utils/helpers.js';

export const register = asyncHandler(async (req, res) => {
    const userData = await authService.register(req.body);
    res.status(201).json({
        status: 'success',
        data: userData
    });
});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const userData = await authService.login(email, password);
    res.status(200).json({
        status: 'success',
        data: userData
    });
});