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
      text-align: center;
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
      <h1 style="font-size: 28px; color: #6f4e37;">Insuppent</h1>
    </div>
    <div class="header">
      <h2>Hello ${leadData.name},</h2>
    </div>
    <div class="content">
      <p>You've received this message because you subscribed to Insuppent. Please confirm your subscription to receive emails from us:</p>
      <a href="#" class="confirm-button">Click to confirm your subscription</a>
      <p>Thank you,</p>
      <p>The Insuppent Team</p>
    </div>
    <div class="footer">
      <a href="#"><img src="https://via.placeholder.com/24" alt="YouTube" style="vertical-align: middle;"></a>
      <a href="#"><img src="https://via.placeholder.com/24" alt="LinkedIn" style="vertical-align: middle;"></a>
      <a href="#"><img src="https://via.placeholder.com/24" alt="Facebook" style="vertical-align: middle;"></a>
      <a href="#"><img src="https://via.placeholder.com/24" alt="Instagram" style="vertical-align: middle;"></a>
      <p style="margin-top: 10px;">If you received this email by mistake, simply delete it. You won't receive any more emails from us unless you confirm your subscription using the link above.</p>
    </div>
  </div>
</body>
</html>
`;

export default emailTemplate;
