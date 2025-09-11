const emailTemplate = leadData => `
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
      text-align: left;
    }
    .content p {
      margin: 0 0 15px;
      color: #333;
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
      <h1 style="font-size: 28px; color: #6f4e37;">Insuppent™</h1>
    </div>
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
      <p>Thank you,</p>
      <p>The Insuppent Team</p>
      <p><a href="#">&#128250;</a> <a href="#">&#62220;</a> <a href="#">&#62217;</a> <a href="#">&#62223;</a></p>
      <p>If you received this email by mistake, simply delete it. You won't receive any more emails from us unless you confirm your subscription using the link above.</p>
    </div>
  </div>
</body>
</html>
`;

export default emailTemplate;