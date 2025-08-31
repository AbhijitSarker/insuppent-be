import { Lead } from '../lead/lead.model.js';
import { LeadUser } from './leadUser.model.js';
import { User } from '../user/user.model.js';
import { calculateLeadPrice } from '../../../utils/leadPricing.js';
import ApiError from '../../../errors/ApiError.js';

export async function getLeadsForPurchase(leadIds, userId) {
  const leads = await Lead.findAll({ where: { id: leadIds } });
  if (leads.length !== leadIds.length) throw new ApiError(400, 'Some leads not found');

  for (const lead of leads) {
    if (lead.saleCount >= lead.maxLeadSaleCount) {
      throw new ApiError(400, `Lead ${lead.id} has reached max sale count`);
    }
    const alreadyPurchased = await LeadUser.findOne({ where: { userId, leadId: lead.id } });
    if (alreadyPurchased) {
      throw new ApiError(400, `You have already purchased lead ${lead.id}`);
    }
  }
  return leads;
}

export function buildLineItems(leads, memberLevel) {
  return leads.map(lead => {
    const price = calculateLeadPrice(memberLevel, lead.type);
    if (!price) throw new ApiError(400, `No price found for lead type: ${lead.type}`);
    return {
      price_data: {
        currency: 'usd',
        product_data: {
          name: `Lead: ${lead.name}`,
          description: `${lead.type} - ${lead.state}`,
        },
        unit_amount: Math.round(price * 100),
      },
      quantity: 1,
    };
  });
}

export async function recordLeadPurchases({ userId, leadIds, stripeSessionId }) {
  for (const leadId of leadIds) {
    const lead = await Lead.findByPk(leadId);
    if (!lead) continue;
    if (lead.saleCount >= lead.maxLeadSaleCount) continue;
    const alreadyPurchased = await LeadUser.findOne({ where: { userId, leadId } });
    if (alreadyPurchased) continue;
    await LeadUser.create({ userId, leadId, purchasedAt: new Date(), stripeSessionId });
    await lead.increment('saleCount');
  }
}

export async function getUserPurchaseHistory(userId) {
  return LeadUser.findAll({
    where: { userId },
    include: [{ model: Lead }],
    order: [['purchasedAt', 'DESC']],
  });
}


// Get all leads purchased by a user, with lead details
export async function getMyLeads(userId) {
  // Ensure association is set up
  if (!LeadUser.associations || !LeadUser.associations.Lead) {
    LeadUser.belongsTo(Lead, { foreignKey: 'leadId' });
  }
  const leadUsers = await LeadUser.findAll({
    where: { userId },
    include: [{ model: Lead }],
    order: [['purchasedAt', 'DESC']],
  });
  // Flatten to just lead data, but include purchase info
  const flattened = leadUsers.map(lu => ({
    ...lu.Lead?.toJSON?.(),
    datePurchased: lu.purchasedAt,
    leadStatus: lu.leadStatus,
    comment: lu.comment,
  }));
  return flattened;
}

// Update status for a purchased lead
export async function updateLeadStatus({ userId, leadId, status }) {
  const leadUser = await LeadUser.findOne({ where: { userId, leadId } });

  if (!leadUser) throw new ApiError(404, 'Purchased lead not found');
  leadUser.leadStatus = status;
  await leadUser.save();
  return leadUser;
}

// Upsert comment for a purchased lead
export async function upsertLeadComment({ userId, leadId, comment }) {
  const leadUser = await LeadUser.findOne({ where: { userId, leadId } });
  if (!leadUser) throw new ApiError(404, 'Purchased lead not found');
  leadUser.comment = comment;
  await leadUser.save();
  return leadUser;
}

// Update user's purchased count
export async function updateUserPurchasedCount(userId, count) {
  const user = await User.findByPk(userId);
  if (!user) throw new ApiError(404, 'User not found');
  user.purchased += count;
  await user.save();
  return user;
}

// Get purchased leads for a specific user
export async function getUserPurchasedLeads(userId, status) {
  if (!LeadUser.associations || !LeadUser.associations.Lead) {
    LeadUser.belongsTo(Lead, { foreignKey: 'leadId' });
  }
  const leadUsers = await LeadUser.findAll({
    where: { userId },
    include: [{ model: Lead }],
    order: [['purchasedAt', 'DESC']],
  });

    return leadUsers.map(lu => {
      const leadData = lu.Lead?.toJSON?.() || {};
      const { id: leadId, ...restLeadData } = leadData;
      return {
        id: lu.id, // LeadUser row id
        leadId, // Lead model id
        ...restLeadData,
        datePurchased: lu.purchasedAt,
        leadStatus: lu.leadStatus,
        comment: lu.comment,
        isRefunded: lu.isRefunded,
      };
    });
}