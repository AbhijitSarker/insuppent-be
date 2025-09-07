import { parsePayload } from '../../../helpers/parsePayload.js';
import { Lead } from './lead.model.js';
import LeadMembershipMaxSaleCount from './leadTypeMaxSaleCount.model.js';
import { generatePersonalizedEmails } from '../../../utils/openai.js';
import { LeadUser } from '../purchase/leadUser.model.js';
// import { getStateFromZipCode } from '../../../helpers/zipCodeHelper.js';
import { LEAD_MESSAGES } from '../../../enums/messages.js';
import ApiError from '../../../errors/ApiError.js';
import httpStatus from 'http-status';
import { Op } from 'sequelize';
import { calculateLeadPrice } from '../../../utils/leadPricing.js';

const processWebhookData = async payload => {
  const body = parsePayload(payload);

  const leadData = {
    zipCode: body['Zip Code']?.trim(),
    state: body['State']?.trim(),
    name: `${body['First Name']?.trim()} ${body['Last Name']?.trim()}`.trim(),
    email: body['Email']?.toLowerCase().trim(),
    phone: body['Phone']?.replace(/\D/g, ''),
    address: (body['Street Address'] || body['Full Street Address'])?.trim(),
    type: (() => {
      const formName = body['form_name']?.toLowerCase().trim();
      if (formName?.includes('auto')) return 'auto';
      if (formName?.includes('home')) return 'home';
      if (formName?.includes('mortgage')) return 'mortgage';
      return 'other';
    })(),
  };

  // Generate emails using OpenAI
  let emails = [];
  try {
    emails = await generatePersonalizedEmails(leadData);
    console.log('Generated Emails:', emails);
  } catch (e) {
    emails = [];
    // Optionally log error
  }
  leadData.emails = emails;
  return await Lead.create(leadData);
};

const getSingleLead = async id => {
  const result = await Lead.findByPk(id);

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, LEAD_MESSAGES.NOT_FOUND);
  }

  return result;
};

const getAllLeads = async () => {
  const result = await Lead.findAll();
  return result;
};

const findLeads = async (memberLevelFromUser = 'subscriber', userId = null) => {
  // Exclude leads already purchased by the user
  let excludeLeadIds = [];
  // if (userId) {
    const purchasedLeads = await LeadUser.findAll({
      where: { userId: userId },
      attributes: ['leadId'],
      raw: true,
    });
    excludeLeadIds = purchasedLeads.map(lu => lu.leadId);
  // }
//todo
  // Fetch maxLeadSaleCount for this membership
  const membership = memberLevelFromUser || 'subscriber';
  console.log('Finding leads for membership:', membership, 'and userId:', userId);
  let maxLeadSaleCount = 50;
  const membershipConfig = await LeadMembershipMaxSaleCount.findOne({ where: { membership } });
  if (membershipConfig) maxLeadSaleCount = membershipConfig.maxLeadSaleCount;
  console.log(`Membership: ${membershipConfig.maxLeadSaleCount}, Max Lead Sale Count: ${maxLeadSaleCount}`);
  // Only return leads that are public, not purchased by user, and saleCount < maxLeadSaleCount
  const where = {
    status: 'public',
    ...(excludeLeadIds.length > 0 ? { id: { [Op.notIn]: excludeLeadIds } } : {}),
  };
  const result = await Lead.findAll({ where });
  // Defensive: filter again after query in case of any ORM issues
  const filteredResult = result.filter(lead => {
    return (!excludeLeadIds.includes(lead.id)) && (lead.saleCount < maxLeadSaleCount);
  });
  const maskedResult = filteredResult.map(lead => {
    const leadObj = lead.toJSON();
    const leadType = leadObj.leadType || leadObj.type || 'auto';
    const price = calculateLeadPrice('subscriber', leadType);
    return {
      ...leadObj,
      email: leadObj.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
      phone: leadObj.phone.replace(/(\d{3})(\d+)(\d{2})/, '$1****$3'),
      price,
      maxLeadSaleCount, // include in response for frontend
    };
  });
  return maskedResult;
};

const updateLead = async (id, payload) => {
  await Lead.update(payload, { where: { id } });
  const result = await Lead.findByPk(id);

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, LEAD_MESSAGES.NOT_FOUND);
  }

  return result;
};

const deleteLead = async id => {
  const existing = await Lead.findByPk(id);
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, LEAD_MESSAGES.NOT_FOUND);
  }
  await Lead.destroy({ where: { id } });
  return existing;
};

const updateStatus = async (id, status) => {
  await Lead.update({ status }, { where: { id } });
  const result = await Lead.findByPk(id);

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
  }

  return result;
};
// Bulk update maxLeadSaleCount for all leads of a given membership and update the config table
const updateMaxLeadSaleCountByMembership = async (membership, maxLeadSaleCount) => {
  // Update config table
  await LeadMembershipMaxSaleCount.upsert({ membership, maxLeadSaleCount });
  // Update all leads for this membership (if you want to update all leads, you may need to join with users or store membership info on leads)
  // Here, we assume you want to update all leads regardless of type
  const [affectedRows] = await Lead.update(
    { maxLeadSaleCount },
    { where: {} }
  );
  return { affectedRows };
};

// Fetch all lead membership max sale counts
const getAllLeadMembershipMaxSaleCounts = async () => {
  return await LeadMembershipMaxSaleCount.findAll();
};

// Fetch sale counts for all memberships (requires joining with users if you want per membership)
const getLeadSaleCountsByMembership = async () => {
  // Returns: [{ membership, saleCount, totalLeads }]
  // This requires a join with users if you want to group by membership
  // For now, just return total saleCount and totalLeads
  const { Lead } = await import('./lead.model.js');
  const results = await Lead.findAll({
    attributes: [
      [Lead.sequelize.fn('SUM', Lead.sequelize.col('saleCount')), 'saleCount'],
      [Lead.sequelize.fn('COUNT', Lead.sequelize.col('id')), 'totalLeads'],
    ],
    raw: true,
  });
  return results;
};
export const LeadService = {
  processWebhookData,
  getSingleLead,
  getAllLeads,
  findLeads,
  updateLead,
  deleteLead,
  updateStatus,
  updateMaxLeadSaleCountByMembership,
  getAllLeadMembershipMaxSaleCounts,
  getLeadSaleCountsByMembership,
};
