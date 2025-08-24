// SSO routes
import { Router } from 'express';
import { login, callback, getUser, logout, checkAuth, refreshToken } from './sso.controller.js';
import { requireAuth } from '../../middlewares/auth.js';

const router = Router();

// Public routes
router.get('/login', login);
router.get('/callback', callback);
router.get('/check', checkAuth);

// Protected routes
router.get('/user', requireAuth, getUser);
router.post('/refresh', requireAuth, refreshToken);
router.get('/logout', logout); // Can be accessed even if not authenticated

export default router;