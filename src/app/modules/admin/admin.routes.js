import express from 'express';
import { AdminController } from './admin.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { adminValidation } from './admin.validations.js';
import auth from '../../middlewares/auth.js';
import { ENUM_USER_ROLE } from '../../../enums/user.js';

const router = express.Router();

// Public routes
router.post(
  '/signup',
  validateRequest(adminValidation.createAdmin),
  AdminController.createAdmin,
);

router.post(
  '/login',
  validateRequest(adminValidation.loginAdmin),
  AdminController.loginAdmin,
);

router.post('/refresh-token', AdminController.refreshToken);

// Protected routes
router.get(
  '/profile',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AdminController.getAdminProfile,
);

router.patch(
  '/profile',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(adminValidation.updateAdmin),
  AdminController.updateAdminProfile,
);

export const AdminRoutes = router;
