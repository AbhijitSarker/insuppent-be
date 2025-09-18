const emailTemplate = leadData => {
  // Default to current date and time if purchaseDate is not provided
  const defaultPurchaseDate = '9/18/2025, 06:53 AM +06';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        html, body {
          margin: 0;
          padding: 0;
          width: 100% !important;
          height: 100% !important;
          background: #f5f5f5;
        }
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          background: #f5f5f5;
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
        .container {
          max-width: 700px;
          margin: 0 auto;
          background: #fff;
          border-radius: 0;
          min-height: 0;
        }
        .logo-area {
          text-align: center;
          padding: 20px 0;
          background-color: #f5f5f5;
        }
        .header {
          background-color: #000;
          padding: 20px;
          text-align: center;
        }
        .content {
          text-align: left;
          padding: 20px;
        }
        .payment-details, ul {
          background-color: #fff;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0px;
          text-align: left;
        }
        .payment-details h3 {
          margin-top: 0;
        }
        .payment-details p {
          margin: 10px 0;
        }
        .confirm-button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #6f4e37;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          background: none;
        }
        .footer a {
          margin: 0 5px;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f5f5f5" style="width:100%;background:#f5f5f5;table-layout:fixed;overflow:hidden;">
        <tr>
          <td align="center" style="padding:0;">
            <div class="container" style="min-height:0;">
              <div class="logo-area">
               <img src="https://i.ibb.co.com/dJzZpxz9/Insuplex360.png" alt="Insuplex360" style="max-width:200px;width:100%;height:auto;display:inline-block;" border="0" />
              </div>
              <div class="header">
                <h1 style="color: #000 !important; margin:0;">Purchase Confirmation</h1>
              </div>
              <div class="content">
                <p style="color: #000 !important;">Dear Customer,</p>
                <p style="color: #000 !important;">Congratulations! Your purchase of the following lead has been successfully completed:</p>
                <h2 style="color: #000 !important;">Lead Details</h2>
                <ul>
                  <li style="color: #000 !important;"><strong>Name:</strong> ${leadData.name || 'N/A'}</li>
                  <li style="color: #000 !important;"><strong>Email:</strong> ${leadData.email || 'N/A'}</li>
                  <li style="color: #000 !important;"><strong>Phone:</strong> ${leadData.phone || 'N/A'}</li>
                  <li style="color: #000 !important;"><strong>Address:</strong> ${leadData.address || 'N/A'}</li>
                  <li style="color: #000 !important;"><strong>Zip Code:</strong> ${leadData.zipCode || 'N/A'}</li>
                  <li style="color: #000 !important;"><strong>State:</strong> ${leadData.state || 'N/A'}</li>
                  <li style="color: #000 !important;"><strong>Type:</strong> ${leadData.type || 'N/A'}</li>
                  <li style="color: #000 !important;"><strong>Purchase Date:</strong> ${leadData.purchaseDate || defaultPurchaseDate}</li>
                </ul>
                <p style="color: #000 !important;">Thank you for choosing our service. We wish you success in utilizing this lead.</p>
                <p style="color: #000 !important;">If you have any questions or need further assistance, please contact our support team.</p>
              </div>
            </div>
            <div class="footer">
              <table align="center" style="margin: 20px auto 0 auto; border-spacing: 10px 0;">
              <tr>
              <td>
              <a href="https://www.youtube.com/channel/UCXmxrb1OjUalSC-1eIFceCQ" target="_blank" style="display:inline-block;">
              <img src="https://ci3.googleusercontent.com/meips/ADKq_Naos2k7LLOFGbiHjDOFhombXWPF6ZxuCflTI9llUgsiDJUYsSeQjvWYRB7CWT5NNSTUrxeAnNiCkPy6QroOa7U7Gxpwe1zwBS-DGREC5PPE5x5mWCKbRg=s0-d-e1-ft#https://insuppent.com/wp-content/uploads/2025/06/youtube_icon.png" alt="YouTube" width="32" height="32" style="background:#794b35; border-radius:6px; padding:6px; display:block;" />
              </a>
              </td>
              <td>
              <a href="http://www.linkedin.com/in/insuppent-l-l-c-b49617348" target="_blank" style="display:inline-block;">
              <img src="https://ci3.googleusercontent.com/meips/ADKq_NZbVreFpTfUSOlmSE3YQ9pBKTjSLJWSgLf-LhGB6Ak3K6YOpq5W3W3gGDP8AX_NNKY9boypfot8mW6hZbVV9WHDatDfnT6i7eMnfZtJo8AVagwY7hMuMIo=s0-d-e1-ft#https://insuppent.com/wp-content/uploads/2025/06/linkedin_icon.png" alt="LinkedIn" width="32" height="32" style="background:#794b35; border-radius:6px; padding:6px; display:block;" />
              </a>
              </td>
              <td>
              <a href="https://www.facebook.com/profile.php?id=61572261156248" target="_blank" style="display:inline-block;">
              <img src="https://ci3.googleusercontent.com/meips/ADKq_NZG0I-rCXTJUJyNY_IrT-ui6fd71kAoi9up1BtqdiuAvlEQQcpTOwti20fOY_V5L3nhKsWyEQTHawtCZF-Goq5kyXqrChBLEeGVDaDqNJPRKWVolNpbIXI=s0-d-e1-ft#https://insuppent.com/wp-content/uploads/2025/06/facebook_icon.png" alt="Facebook" width="32" height="32" style="background:#794b35; border-radius:6px; padding:6px; display:block;" />
              </a>
              </td>
              <td>
              <a href="https://www.instagram.com/insuppent" target="_blank" style="display:inline-block;">
              <img src="https://ci3.googleusercontent.com/meips/ADKq_NZsXPGGlifnOcV0-Go64_UrDvnjJG1Baf2UqLYIlqaE7gkpJOolGp5IhXRh77DQXkR3LJWISETQWpt5DtPdFPwwEl9NzXiIwvZglABhoJI8VzpZlKCDLd2Y=s0-d-e1-ft#https://insuppent.com/wp-content/uploads/2025/06/instagram_icon.png" alt="Instagram" width="32" height="32" style="background:#794b35; border-radius:6px; padding:6px; display:block;" />
              </a>
              </td>
              </tr>
              </table>
            <p style="color: #000 !important; margin-top: 10px;">This is an automated notification from the Insuplex platform. Please do not reply to this email.</p>
            </div>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}
  export default emailTemplate;