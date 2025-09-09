import express from 'express';
import * as adminAuthController from './admin.auth.controller.js';
import { adminAuth } from '../../../middlewares/adminAuth.js';
import validateRequest from '../../../middlewares/validateRequest.js';
import { AdminValidation } from '../admin.validations.js';

const router = express.Router();

// Auth endpoints
router.post(
  '/register',
  validateRequest(AdminValidation.createAdmin),
  adminAuthController.registerAdmin
);

router.post(
  '/login',
  validateRequest(AdminValidation.loginAdmin),
  adminAuthController.loginAdmin
);

router.post(
  '/forgot-password',
  validateRequest(AdminValidation.forgotPassword),
  adminAuthController.forgotPassword
);

router.post(
  '/reset-password/:token',
  validateRequest(AdminValidation.resetPassword),
  adminAuthController.resetPassword
);

// Protected routes
router.get('/profile', adminAuth, adminAuthController.getAdminProfile);

// Change password
router.post(
  '/change-password',
  adminAuth,
  validateRequest(AdminValidation.changePassword),
  adminAuthController.changePassword
);

export const AdminAuthRoutes = router;
