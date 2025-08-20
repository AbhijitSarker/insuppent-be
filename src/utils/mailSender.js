import nodemailer from 'nodemailer';

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
}