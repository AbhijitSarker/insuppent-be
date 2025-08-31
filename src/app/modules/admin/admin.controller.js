
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { AdminService, markLeadUserRefunded } from './admin.service.js';

import config from '../../../config/index.js';

const createAdmin = catchAsync(async (req, res) => {
  const result = await AdminService.createAdmin(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Admin created successfully',
    data: result,
  });
});

const loginAdmin = catchAsync(async (req, res) => {
  const result = await AdminService.loginAdmin(req.body);
  const { refreshToken, accessToken } = result;

  // Set refresh token in cookie
  const cookieOptions = {
    secure: config.env === 'production',
    httpOnly: true,
  };
  res.cookie('refreshToken', refreshToken, cookieOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin logged in successfully',
    data: { accessToken },
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await AdminService.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access token generated successfully',
    data: result,
  });
});

const getAdminProfile = catchAsync(async (req, res) => {
  const result = await AdminService.getAdminProfile(req.user.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin profile retrieved successfully',
    data: result,
  });
});

const updateAdminProfile = catchAsync(async (req, res) => {
  const result = await AdminService.updateAdminProfile(req.user.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin profile updated successfully',
    data: result,
  });
});

// PATCH /admin/lead-user/:id/refund
const markLeadUserRefundedController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { isRefunded } = req.body;
  const result = await markLeadUserRefunded(id, isRefunded);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `LeadUser marked as ${result.isRefunded ? 'Refunded' : 'Not Refunded'}`,
    data: result,
  });
});

export const AdminController = {
  createAdmin,
  loginAdmin,
  refreshToken,
  getAdminProfile,
  updateAdminProfile,
  markLeadUserRefundedController,
};
