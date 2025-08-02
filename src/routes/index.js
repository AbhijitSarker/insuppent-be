import { Router } from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import leadRoutes from './leads.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/leads', leadRoutes);

export default router;