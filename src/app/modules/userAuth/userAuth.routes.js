import express from 'express';
import { UserAuthController } from './userAuth.controller.js';
import userAuth from '../../middlewares/userAuth.js';

const router = express.Router();

// Public routes
router.post('/verify-wp-user', UserAuthController.verifyWpUser);

// Protected routes
router.get('/profile', userAuth, UserAuthController.getUserProfile);
router.post('/refresh-token', userAuth, UserAuthController.refreshToken);

export default router;