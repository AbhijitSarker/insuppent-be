import config from '../../../config/index.js';
import { getMyLeads, updateLeadStatus, upsertLeadComment } from './leadPurchase.service.js';

import ApiError from '../../../errors/ApiError.js';
import { getLeadsForPurchase, buildLineItems, recordLeadPurchases, getUserPurchaseHistory } from './leadPurchase.service.js';
import { createStripeSession, constructStripeEvent } from './stripe.util.js';

export const createCheckoutSession = async (req, res, next) => {
  console.log('createCheckoutSession called', req.user);
  try {
    const { leadIds } = req.body;

    // const userId = req.user.id;
    if (!Array.isArray(leadIds) || leadIds.length === 0) return next(new ApiError(400, 'No leads selected'));
    
    const leads = await getLeadsForPurchase(leadIds, 2);
    // const memberLevel = req.user.wpRoles[0] || 'subscriber';
// console.log('Leads for Purchase:', memberLevel);

    const line_items = buildLineItems(leads, 'subscriber');
    const session = await createStripeSession({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: 'abhijitsarker03@gmail.com',
      metadata: {
        // userId,
        //todo fix this
        userId: 2,
        leadIds: leadIds.join(','),
      },
  success_url: `${config.frontendUrl || 'http://localhost:5173'}/my-leads?success=1`,
  cancel_url: `${config.frontendUrl || 'http://localhost:5173'}?canceled=1`,
    });
    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
};



export const stripeWebhook = async (req, res, next) => {
  console.log('stripeWebhook called');
  let event;
  try {
    const sig = req.headers['stripe-signature'];
    event = constructStripeEvent(
      req.body,
      sig,
      config.stripeWebhookSecret
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    console.log('checkout.session.completed event received');
    const session = event.data.object;
    const userId = session.metadata.userId;
    const leadIds = session.metadata.leadIds.split(',').map(Number);
    await recordLeadPurchases({ userId, leadIds, stripeSessionId: session.id });
    // Update user's purchased count
    try {
      const { updateUserPurchasedCount } = await import('./leadPurchase.service.js');
      await updateUserPurchasedCount(userId, leadIds.length);
    } catch (err) {
      console.error('Failed to update user purchased count:', err);
    }
  }
  res.json({ received: true });
};

// GET /purchase/user/:userId/leads
export const getUserPurchasedLeadsController = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const { status } = req.query;
    const { getUserPurchasedLeads } = await import('./leadPurchase.service.js');
    const leads = await getUserPurchasedLeads(userId, status);
    res.json({ data: leads });
  } catch (err) {
    next(err);
  }
};

export const getPurchaseHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const purchases = await getUserPurchaseHistory(userId);
    res.json({ data: purchases });
  } catch (err) {
    next(err);
  }
};

// GET /leads/my
export const getMyLeadsController = async (req, res, next) => {
  try {
    //todo fix this
    // const userId = req.user.id;
    const leads = await getMyLeads(2);
    res.json({ data: leads });
  } catch (err) {
    next(err);
  }
};

// PATCH /purchase/:leadId/status
export const updateLeadStatusController = async (req, res, next) => {
  try {
    // const userId = req.user.id;
    const { leadId } = req.params;
    const { status } = req.body;
    const updated = await updateLeadStatus({ userId: 2, leadId, status });
    console.log('updated', updated);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
};

// PATCH /purchase/:leadId/comment
export const upsertLeadCommentController = async (req, res, next) => {
  try {
    // const userId = req.user.id;
    const { leadId } = req.params;
    const { comment } = req.body;
    const updated = await upsertLeadComment({ userId: 2, leadId, comment });
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
};