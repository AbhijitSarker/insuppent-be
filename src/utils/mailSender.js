import nodemailer from 'nodemailer';
import emailTemplate from './leadInfoEmailTemplate.js';
import adminPurchaseNotificationTemplate from './adminPurchaseNotificationTemplate.js';

const transporter = nodemailer.createTransport({
  host: 'mail.insuppent.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'leads@insuppent.com',
    pass: '%1*m1`oj%dl1',
  },
});

export const sendMail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: 'leads@insuppent.com',
    to,
    subject,
    text,
    ...(html && { html }),
  };
  return transporter.sendMail(mailOptions);
};

// Helper to send lead info mail
export const sendLeadInfoMail = async (to, leadData) => {
  return sendMail({
    to,
    subject: 'Purchase Confirmation - Lead Details',
    html: emailTemplate(leadData),
  });
};

// Helper to send admin purchase notification
export const sendAdminPurchaseNotification = async (purchaseData) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  
  return sendMail({
    to: adminEmail,
    subject: `Payment received – ${purchaseData.user.name} purchased a lead`,
    html: adminPurchaseNotificationTemplate(purchaseData),
  });
};
