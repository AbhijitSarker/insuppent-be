import LeadMembershipMaxSaleCount from '../modules/lead/leadTypeMaxSaleCount.model.js';

export const seedLeadMembershipMaxSaleCounts = async () => {
  const memberships = [
    { membership: 'subscriber', maxLeadSaleCount: 50 },
    { membership: 'startup', maxLeadSaleCount: 80 },
    { membership: 'agency', maxLeadSaleCount: 200 }, // add more memberships as needed
  ];
  for (const m of memberships) {
    await LeadMembershipMaxSaleCount.findOrCreate({ where: { membership: m.membership }, defaults: { maxLeadSaleCount: m.maxLeadSaleCount } });
  }
  console.log('Seeded LeadMembershipMaxSaleCount');
};

// To use: import and call seedLeadMembershipMaxSaleCounts() in your DB seed script or migration.
