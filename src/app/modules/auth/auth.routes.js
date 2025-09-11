// app/modules/auth/auth.routes.js
import express from 'express';
import {
    verifyWordPressAuth,
    getCurrentUser,
    logout,
    refreshAuth,
    checkAuth,
} from './auth.controller.js';
import { requireAuth } from '../../middlewares/wpAuth.js';

const router = express.Router();

// Verify WordPress authentication
router.get('/verify', verifyWordPressAuth);

// Check authentication status
router.get('/check', checkAuth);

// Get current authenticated user
router.get('/me', requireAuth, getCurrentUser);

// Refresh authentication
router.post('/refresh', refreshAuth);

// Logout
router.post('/logout', logout);

export default router;