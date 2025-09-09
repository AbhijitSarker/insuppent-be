// Mark LeadUser as refunded
import express from 'express';
import { AdminController } from './admin.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { AdminValidation } from './admin.validations.js';
// import auth from '../../middlewares/auth.js';
import { ENUM_USER_ROLE } from '../../../enums/user.js';

const router = express.Router();

// Protected routes begin here

// Protected routes
router.post(
  '/change-password',
  // auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(AdminValidation.changePassword),
  AdminController.changePassword
);
router.get(
  '/profile',
  // auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AdminController.getAdminProfile,
);

router.patch(
  '/profile',
  // auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(AdminValidation.updateAdmin),
  AdminController.updateAdminProfile,
);
router.patch('/lead-user/:id/refund', AdminController.markLeadUserRefundedController);

export const AdminRoutes = router;
