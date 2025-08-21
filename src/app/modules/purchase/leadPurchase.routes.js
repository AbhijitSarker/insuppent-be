import express from 'express';
import { createCheckoutSession, stripeWebhook, getPurchaseHistory } from './leadPurchase.controller.js';
import auth from '../../middlewares/auth.js';

const router = express.Router();

router.post('/checkout', auth(), createCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
router.get('/history', auth(), getPurchaseHistory);

export default router;
