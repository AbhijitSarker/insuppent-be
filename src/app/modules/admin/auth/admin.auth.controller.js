import httpStatus from 'http-status';
import * as adminAuthService from './admin.auth.service.js';
import catchAsync from '../../../../shared/catchAsync.js';
import sendResponse from '../../../../shared/sendResponse.js';

export const registerAdmin = catchAsync(async (req, res) => {
  const result = await adminAuthService.registerAdmin(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Admin registered successfully',
    data: result,
  });
});

export const loginAdmin = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await adminAuthService.loginAdmin(email, password);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin logged in successfully',
    data: result,
  });
});

export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await adminAuthService.forgotPassword(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password reset email sent successfully',
    data: result,
  });
});

export const resetPassword = catchAsync(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const result = await adminAuthService.resetPassword(token, password);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password reset successful',
    data: result,
  });
});

export const getAdminProfile = catchAsync(async (req, res) => {
  const admin = await adminAuthService.getAdminProfile(req.admin.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin profile retrieved successfully',
    data: admin,
  });
});
