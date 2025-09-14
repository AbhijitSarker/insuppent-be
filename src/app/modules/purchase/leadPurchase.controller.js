import config from '../../../config/index.js';
import { getMyLeads, updateLeadStatus, upsertLeadComment } from './leadPurchase.service.js';

import ApiError from '../../../errors/ApiError.js';
import { getLeadsForPurchase, buildLineItems, recordLeadPurchases, getUserPurchaseHistory } from './leadPurchase.service.js';
import { createStripeSession, constructStripeEvent } from './stripe.util.js';

import { User } from '../user/user.model.js';
import { LeadService } from '../lead/lead.service.js';
import { sendLeadInfoMail, sendAdminPurchaseNotification } from '../../../utils/mailSender.js';

export const createCheckoutSession = async (req, res, next) => {
  console.log('createCheckoutSession called', req.user);
  try {
    const { leadIds } = req.body;

    // const userId = req.user.id;
    if (!Array.isArray(leadIds) || leadIds.length === 0) return next(new ApiError(400, 'No leads selected'));
    
    const leads = await getLeadsForPurchase(leadIds, req.user.id);
    const memberLevel = req.user.membership|| 'subscriber';

    const line_items = buildLineItems(leads, memberLevel);
    const session = await createStripeSession({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: req.user.email,
      metadata: {
        // userId,
        //todo fix this
        userId: req.user.id,
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
    const session = event.data.object;
    const userId = session.metadata.userId;
    const price = session.amount_total / 100;
    const leadIds = session.metadata.leadIds.split(',').map(Number);

    await recordLeadPurchases({ userId, leadIds, stripeSessionId: session.id });
    // Update user's purchased count
    try {
      const { updateUserPurchasedCount } = await import('./leadPurchase.service.js');
      await updateUserPurchasedCount(userId, leadIds.length);
    } catch (err) {
      console.error('Failed to update user purchased count:', err);
    }

    // Send email to user with lead info for each purchased lead
    try {
      // Get user email
      const user = await User.findByPk(userId);
      if (user && user.email) {
        const purchasedLeads = [];
        
        for (const leadId of leadIds) {
          // Always fetch lead from DB to ensure latest info
          const lead = await LeadService.getSingleLead(leadId);
          console.log('Fetched lead for email:', lead, lead ? 'found' : 'not found');
          if (lead) {
            purchasedLeads.push(lead.toJSON());
            try {
              const mailResult = await sendLeadInfoMail('abhijitsarker03@gmail.com', lead.toJSON());
            } catch (mailErr) {
              console.error('Error sending mail for lead', leadId, mailErr);
            }
          }
        }
        
        // Send admin notification email
        try {
          const purchaseDate = new Date().toLocaleString();
          const purchaseData = {
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              membership: user.membership || 'subscriber'
            },
            leads: purchasedLeads,
            sessionId: session.id,
            purchaseDate,
            totalAmount: price
          };
          
          const adminMailResult = await sendAdminPurchaseNotification(purchaseData);
          console.log('Admin notification mail sent result:', adminMailResult && adminMailResult.accepted);
        } catch (adminMailErr) {
          console.error('Error sending admin notification email:', adminMailErr);
        }
      }
    } catch (err) {
      console.error('Failed to send lead info email:', err);
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
  console.log('getMyLeadsController called for user:', req.user);
  try {
    const leads = await getMyLeads(req.user.id);
    res.json({ data: leads });
  } catch (err) {
    next(err);
  }
};

// PATCH /purchase/:leadId/status
export const updateLeadStatusController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { leadId } = req.params;
    const { status } = req.body;
    const updated = await updateLeadStatus({ userId, leadId, status });

    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
};

// PATCH /purchase/:leadId/comment
export const upsertLeadCommentController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { leadId } = req.params;
    const { comment } = req.body;
    const updated = await upsertLeadComment({ userId, leadId, comment });
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
};