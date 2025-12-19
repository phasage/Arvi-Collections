const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create transporter
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });

  let html;
  
  // Generate HTML based on template
  switch (options.template) {
    case 'emailVerification':
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">Welcome to Arvi's Collection!</h2>
          <p>Hi ${options.data.name},</p>
          <p>Thank you for registering with Arvi's Collection. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${options.data.verificationUrl}" 
               style="background: linear-gradient(45deg, #667eea, #764ba2); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p><a href="${options.data.verificationUrl}">${options.data.verificationUrl}</a></p>
          <p>This link will expire in 24 hours.</p>
          <p>Best regards,<br>The Arvi's Collection Team</p>
        </div>
      `;
      break;
      
    case 'passwordReset':
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">Password Reset Request</h2>
          <p>Hi ${options.data.name},</p>
          <p>You requested a password reset for your Arvi's Collection account. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${options.data.resetUrl}" 
               style="background: linear-gradient(45deg, #667eea, #764ba2); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p><a href="${options.data.resetUrl}">${options.data.resetUrl}</a></p>
          <p>This link will expire in 10 minutes.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Best regards,<br>The Arvi's Collection Team</p>
        </div>
      `;
      break;
      
    default:
      html = `<p>${options.message}</p>`;
  }

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;