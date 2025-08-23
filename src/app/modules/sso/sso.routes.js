// SSO routes
import { Router } from 'express';
import { login, callback, getUser, logout } from './sso.controller.js';
const router = Router();

router.get('/login', login);
router.get('/callback', callback);
router.get('/user', getUser);
router.get('/logout', logout);

export default router;
