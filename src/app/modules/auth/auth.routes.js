// app/modules/auth/auth.routes.js
import express from 'express';
import {
    verifyWordPressAuth,
    getCurrentUser,
    logout,
    refreshAuth,
} from './auth.controller.js';

const router = express.Router();

// Verify WordPress authentication
router.get('/verify', verifyWordPressAuth);

// Get current authenticated user
router.get('/me', getCurrentUser);

// Refresh authentication
router.post('/refresh', refreshAuth);

// Logout
router.post('/logout', logout);

export default router;