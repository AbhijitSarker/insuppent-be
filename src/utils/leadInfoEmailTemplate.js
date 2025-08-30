// Lead info email template for purchase confirmation
const emailTemplate = (leadData) => `
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
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9f9f9;
    }
    .header {
      background-color: #007bff;
      color: #fff;
      padding: 10px;
      text-align: center;
    }
    .content {
      padding: 20px;
      background-color: #fff;
      border-radius: 5px;
    }
    .footer {
      text-align: center;
      padding: 10px;
      font-size: 12px;
      color: #777;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Purchase Confirmation</h1>
    </div>
    <div class="content">
      <p>Dear Customer,</p>
      <p>Congratulations! Your purchase of the following lead has been successfully completed:</p>
      <h2>Lead Details</h2>
      <ul>
        <li><strong>Name:</strong> ${leadData.name}</li>
        <li><strong>Email:</strong> ${leadData.email}</li>
        <li><strong>Phone:</strong> ${leadData.phone}</li>
        <li><strong>Address:</strong> ${leadData.address}</li>
        <li><strong>Zip Code:</strong> ${leadData.zipCode}</li>
        <li><strong>State:</strong> ${leadData.state}</li>
        <li><strong>Type:</strong> ${leadData.type}</li>
        <li><strong>Purchase Date:</strong> ${new Date().toLocaleDateString()}</li>
      </ul>
      <p>Thank you for choosing our service. We wish you success in utilizing this lead.</p>
      <p>If you have any questions or need further assistance, please contact our support team.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export default emailTemplate;
