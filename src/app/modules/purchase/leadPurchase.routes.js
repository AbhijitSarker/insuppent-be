import express from 'express';
import { createCheckoutSession, getPurchaseHistory, getMyLeadsController, updateLeadStatusController, upsertLeadCommentController } from './leadPurchase.controller.js';
import { getUserPurchasedLeadsController } from './leadPurchase.controller.js';
import { adminAuth } from '../../middlewares/adminAuth.js';
import userAuth from '../../middlewares/userAuth.js';

const router = express.Router();

// Admin routes
router.get('/user/:userId/leads', adminAuth, getUserPurchasedLeadsController);

router.post('/checkout', userAuth, createCheckoutSession);
router.get('/history', userAuth, getPurchaseHistory);
router.get('/my-leads', userAuth, getMyLeadsController);
router.patch('/:leadId/status', userAuth, updateLeadStatusController);
router.patch('/:leadId/comment', userAuth, upsertLeadCommentController);

export default router;
