import { sendMail } from "./mailSender.js";

const res = sendMail({
  to: 'abhijitsarker03@gmail.com',
  subject: 'Test Email',
  text: 'This is a test email from Insuppent.',
  html: '<p>This is a <strong>test email</strong> from Insuppent.</p>',
})
  .then(info => {
    console.log('Email sent:', info.response);
  })
  .catch(err => {
    console.error('Error sending email:', err);
  });



  console.log('Email sending initiated...', res);