/**
 * Email template for admin purchase notifications
 * @param {Object} data - Purchase data
 * @returns {string} HTML email template
 */
const adminPurchaseNotificationTemplate = data => {
  const { user, leads, sessionId, purchaseDate } = data;

  // For simplicity, focus on the first lead if multiple leads were purchased
  const lead = leads.length > 0 ? leads[0] : { id: 'N/A', price: 0 };

  // Calculate total amount
  const totalAmount = leads.reduce(
    (total, lead) => total + (lead.price || 0),
    0,
  );

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #fff;
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
          padding: 20px;
          text-align: center;
        }
        .content p {
          margin: 0 0 15px;
          color: #333;
        }
        .payment-details {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
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
          color: #777;
          background-color: #f5f5f5;
        }
        .footer a {
          margin: 0 5px;
          color: #6f4e37;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo-area">
          <h1 style="font-size: 28px; color: #6f4e37;">Insuppent</h1>
        </div>
        <div class="header">
          <h2>Payment Received</h2>
        </div>
        <div class="content">
          <p>A new payment has been received successfully.</p>
          
          <div class="payment-details">
            <h3>Payment details</h3>
            <p><strong>User:</strong> ${user.name || 'N/A'} (${user.email || 'N/A'})</p>
            ${
              leads.length === 1
                ? `<p><strong>Lead ID:</strong> ${lead.id}</p>`
                : `<p><strong>Lead IDs:</strong> ${leads.map(l => l.id).join(', ')}</p>`
            }
            <p><strong>Amount:</strong> $${totalAmount.toFixed(2)}</p>
            <p><strong>Date:</strong> ${purchaseDate}</p>
          </div>
          
          ${leads.length > 1 ? `<p><em>Note: This payment includes ${leads.length} leads.</em></p>` : ''}
          
          <p>Thank you,</p>
          <p>The Insuppent Team</p>
        </div>
        <div class="footer">
          <a href="#"><img src="https://via.placeholder.com/24" alt="YouTube" style="vertical-align: middle;"></a>
          <a href="#"><img src="https://via.placeholder.com/24" alt="LinkedIn" style="vertical-align: middle;"></a>
          <a href="#"><img src="https://via.placeholder.com/24" alt="Facebook" style="vertical-align: middle;"></a>
          <a href="#"><img src="https://via.placeholder.com/24" alt="Instagram" style="vertical-align: middle;"></a>
          <p style="margin-top: 10px;">This is an automated notification from the Insuppent platform. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default adminPurchaseNotificationTemplate;
