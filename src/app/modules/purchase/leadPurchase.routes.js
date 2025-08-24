
import express from 'express';
import { createCheckoutSession, stripeWebhook, getPurchaseHistory, getMyLeadsController } from './leadPurchase.controller.js';
import sessionMiddleware from '../../middlewares/session.js';
import { attachUser } from '../../middlewares/auth.js';

const router = express.Router();


// Apply session middleware to all purchase routes
router.use(sessionMiddleware);
router.use(attachUser)


router.post('/checkout', createCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
router.get('/history', getPurchaseHistory);
router.get('/my-leads', getMyLeadsController);

export default router;
