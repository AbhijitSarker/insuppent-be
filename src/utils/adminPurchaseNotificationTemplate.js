const adminPurchaseNotificationTemplate = data => {
  const { user, leads, sessionId, purchaseDate, totalAmount } = data;

  // For simplicity, focus on the first lead if multiple leads were purchased
  const lead = leads.length > 0 ? leads[0] : { id: 'N/A', price: 0 };

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
          color: #333;
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
          color: #fff;
          padding: 20px;
          text-align: center;
        }
        .content {
          text-align: center;
        }
        .content p {
          margin: 0 0 15px;
          color: #333;
        }
        .payment-details {
          background-color: #fff;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0px;
          text-align: left;
        }
        .payment-details h3 {
          color: #6f4e37;
          margin-top: 0;
        }
        .payment-details p {
          margin: 10px 0;
        }
        .confirm-button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #6f4e37;
          color: #fff;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #6f4e37;
          background: none;
        }
        .footer a {
          margin: 0 5px;
          color: #6f4e37;
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
               <img src="https://i.ibb.co.com/dJzZpxz9/Insuplex360.png" alt="Insuplex360" style="max-width:200px;width:100%;height:auto;display:inline-block;"  border="0" />
              </div>
              <div class="header">
                <h2>Payment Received</h2>
              </div>
              <div class="content">
                <div class="payment-details">
                  <p>A new payment has been received successfully.</p>
                  <h3>Payment details</h3>
                  <p><strong>User:</strong> ${user.name || 'N/A'} (${user.email || 'N/A'})</p>
                  ${leads.length === 1
      ? `<p><strong>Lead ID:</strong> ${lead.id}</p>`
      : `<p><strong>Lead IDs:</strong> ${leads.map(l => l.id).join(', ')}</p>`
    }
                  <p><strong>Amount:</strong> $${totalAmount.toFixed(2)}</p>
                  <p><strong>Date:</strong> ${purchaseDate}</p>
                  ${leads.length > 1 ? `<p><em>Note: This payment includes ${leads.length} leads.</em></p>` : ''}
                  <p>Thank you,</p>
                  <p>The Insuplex Team</p>
                </div>
              </div>
            </div>
            <div class="footer">
                <p style="margin-top: 10px;">This is an automated notification from the Insuppent platform. Please do not reply to this email.</p>
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
              </div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

export default adminPurchaseNotificationTemplate;