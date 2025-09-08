/**
 * Email template for admin purchase notifications
 * @param {Object} data - Purchase data
 * @returns {string} HTML email template
 */
const adminPurchaseNotificationTemplate = (data) => {
  const { user, leads, sessionId, purchaseDate } = data;
  
  // Create lead items HTML
  const leadItems = leads.map(lead => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${lead.id}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${lead.firstName || ''} ${lead.lastName || ''}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${lead.businessName || 'N/A'}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${lead.email || 'N/A'}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${lead.phoneNumber || 'N/A'}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">$${lead.price?.toFixed(2) || '0.00'}</td>
    </tr>
  `).join('');
  
  // Calculate total amount
  const totalAmount = leads.reduce((total, lead) => total + (lead.price || 0), 0);
  
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
          max-width: 800px;
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
        }
        .content p {
          margin: 0 0 15px;
          color: #333;
        }
        .summary {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          padding: 8px;
          border: 1px solid #ddd;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        tfoot td {
          font-weight: bold;
          background-color: #f9f9f9;
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
          <h2>New Lead Purchase Notification</h2>
        </div>
        <div class="content">
          <p>A new purchase has been made on the Insuppent platform.</p>
          
          <div class="summary">
            <h3>Purchase Summary:</h3>
            <p><strong>Purchase ID:</strong> ${sessionId}</p>
            <p><strong>Date:</strong> ${purchaseDate}</p>
            <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
            <p><strong>Number of Leads:</strong> ${leads.length}</p>
          </div>
          
          <h3>Customer Information:</h3>
          <p><strong>Name:</strong> ${user.name || 'N/A'}</p>
          <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
          <p><strong>User ID:</strong> ${user.id}</p>
          <p><strong>Membership Level:</strong> ${user.membership || 'N/A'}</p>
          
          <h3>Purchased Leads:</h3>
          <table>
            <thead>
              <tr>
                <th>Lead ID</th>
                <th>Name</th>
                <th>Business</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              ${leadItems}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5" style="text-align: right;"><strong>Total:</strong></td>
                <td><strong>$${totalAmount.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
          
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
