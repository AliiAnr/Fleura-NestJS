export const buildOtpEmailHtml = (otp: string): string =>
  `
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your OTP Code - FLEURA</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #ffe6f2;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        background-color: #ffffff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        text-align: center;
      }
      h1 {
        font-size: 24px;
        color: #d63384;
      }
      p {
        font-size: 16px;
        color: #666666;
      }
      .otp {
        font-size: 28px;
        font-weight: bold;
        color: #e60073;
        background-color: #ffccdd;
        padding: 10px;
        border-radius: 8px;
        display: inline-block;
        margin: 10px 0;
      }
      .footer {
        margin-top: 20px;
        font-size: 14px;
        color: #999999;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Your OTP Code</h1>
      <p>Hello, please use the following OTP code to proceed:</p>
      <p class="otp">${otp}</p>
      <p>If you did not request this code, please ignore this email.</p>
      <p class="footer">Thank you for using FLEURA!</p>
    </div>
  </body>
</html>
`.trim();

export const buildOtpEmailText = (otp: string): string =>
  `Your OTP code is ${otp}. If you did not request this code, please ignore this email.`;
