const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const security = require('./security');

class MFAService {
  constructor() {
    this.appName = 'Arvi\'s Collection';
    this.issuer = 'Arvi Collection Inc.';
    
    // Configure email transporter (for demo, using ethereal email)
    this.emailTransporter = nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.EMAIL_USER || 'ethereal.user@ethereal.email',
        pass: process.env.EMAIL_PASS || 'ethereal.pass'
      }
    });
    
    // MFA settings
    this.settings = {
      totpWindow: 2, // Allow 2 time steps (60 seconds) tolerance
      smsCodeLength: 6,
      emailCodeLength: 6,
      codeExpiry: 10 * 60 * 1000, // 10 minutes
      maxAttempts: 3,
      lockoutDuration: 30 * 60 * 1000, // 30 minutes
    };
  }

  // Generate TOTP secret for authenticator apps
  generateTOTPSecret(userEmail, userName) {
    const secret = speakeasy.generateSecret({
      name: `${this.appName} (${userEmail})`,
      account: userEmail,
      issuer: this.issuer,
      length: 32
    });

    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url,
      qrCodeUrl: null // Will be generated separately
    };
  }

  // Generate QR code for TOTP setup
  async generateQRCode(otpauthUrl) {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      return qrCodeDataUrl;
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  // Verify TOTP token
  verifyTOTP(token, secret) {
    try {
      return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: this.settings.totpWindow
      });
    } catch (error) {
      return false;
    }
  }

  // Generate SMS/Email verification code
  generateVerificationCode(length = 6) {
    const digits = '0123456789';
    let code = '';
    
    for (let i = 0; i < length; i++) {
      code += digits[crypto.randomInt(0, digits.length)];
    }
    
    return code;
  }

  // Send verification code via email
  async sendEmailCode(email, code, purpose = 'verification') {
    const subject = this.getEmailSubject(purpose);
    const html = this.getEmailTemplate(code, purpose);

    try {
      const info = await this.emailTransporter.sendMail({
        from: `"${this.appName}" <noreply@arviscollection.com>`,
        to: email,
        subject: subject,
        html: html
      });

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info) // For development
      };
    } catch (error) {
      console.error('Email sending failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send verification code via SMS (mock implementation)
  async sendSMSCode(phoneNumber, code, purpose = 'verification') {
    // In production, integrate with Twilio, AWS SNS, or similar service
    console.log(`📱 SMS Code for ${phoneNumber}: ${code} (Purpose: ${purpose})`);
    
    // Mock successful response
    return {
      success: true,
      messageId: `sms_${Date.now()}`,
      message: 'SMS sent successfully (mock)'
    };
  }

  // Store verification code in database
  async storeVerificationCode(userId, code, method, purpose = 'verification') {
    const db = global.db;
    
    const verificationData = {
      userId,
      code: security.hashSensitiveData(code), // Hash the code for security
      method, // 'email', 'sms', 'totp'
      purpose, // 'login', 'password_reset', 'account_verification'
      attempts: 0,
      maxAttempts: this.settings.maxAttempts,
      expiresAt: new Date(Date.now() + this.settings.codeExpiry),
      createdAt: new Date(),
      used: false
    };

    // Clean up old codes for this user and purpose
    await this.cleanupOldCodes(userId, purpose);

    // Store new code
    return db.insert('verification_codes', verificationData);
  }

  // Verify stored code
  async verifyStoredCode(userId, inputCode, purpose = 'verification') {
    const db = global.db;
    
    // Find active verification code
    const codes = db.find('verification_codes', {
      userId,
      purpose,
      used: false
    });

    const activeCode = codes.find(code => 
      new Date(code.expiresAt) > new Date() && 
      code.attempts < code.maxAttempts
    );

    if (!activeCode) {
      return {
        success: false,
        error: 'No valid verification code found or code expired'
      };
    }

    // Check if code matches
    const hashedInput = security.hashSensitiveData(inputCode);
    const isValid = activeCode.code === hashedInput;

    // Update attempts
    const updatedCode = await db.updateById('verification_codes', activeCode._id, {
      attempts: activeCode.attempts + 1,
      used: isValid,
      verifiedAt: isValid ? new Date() : undefined
    });

    if (isValid) {
      return {
        success: true,
        codeId: activeCode._id
      };
    } else {
      // Check if max attempts reached
      if (updatedCode.attempts >= updatedCode.maxAttempts) {
        // Lock the code
        await db.updateById('verification_codes', activeCode._id, {
          locked: true,
          lockedAt: new Date()
        });
        
        return {
          success: false,
          error: 'Maximum verification attempts exceeded. Please request a new code.',
          locked: true
        };
      }
      
      return {
        success: false,
        error: 'Invalid verification code',
        attemptsRemaining: updatedCode.maxAttempts - updatedCode.attempts
      };
    }
  }

  // Clean up old verification codes
  async cleanupOldCodes(userId, purpose) {
    const db = global.db;
    
    // Mark old codes as expired
    const oldCodes = db.find('verification_codes', {
      userId,
      purpose,
      used: false
    });

    for (const code of oldCodes) {
      await db.updateById('verification_codes', code._id, {
        used: true,
        expiredAt: new Date()
      });
    }
  }

  // Setup MFA for user
  async setupMFA(userId, method, data = {}) {
    const db = global.db;
    const user = await db.findUserById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    let mfaData = user.mfaSettings || {};

    switch (method) {
      case 'totp':
        const totpSecret = this.generateTOTPSecret(user.email, user.name);
        const qrCode = await this.generateQRCode(totpSecret.otpauthUrl);
        
        mfaData.totp = {
          secret: security.encryptData(totpSecret.secret),
          enabled: false, // Will be enabled after verification
          setupAt: new Date(),
          backupCodes: this.generateBackupCodes()
        };
        
        // Update user
        await db.updateUser(userId, { mfaSettings: mfaData });
        
        return {
          secret: totpSecret.secret,
          qrCode: qrCode,
          backupCodes: mfaData.totp.backupCodes
        };

      case 'sms':
        if (!data.phoneNumber) {
          throw new Error('Phone number required for SMS MFA');
        }
        
        mfaData.sms = {
          phoneNumber: security.encryptData(data.phoneNumber),
          enabled: false,
          setupAt: new Date()
        };
        
        await db.updateUser(userId, { mfaSettings: mfaData });
        
        // Send verification SMS
        const smsCode = this.generateVerificationCode();
        await this.storeVerificationCode(userId, smsCode, 'sms', 'mfa_setup');
        await this.sendSMSCode(data.phoneNumber, smsCode, 'MFA Setup');
        
        return {
          message: 'SMS verification code sent',
          phoneNumber: data.phoneNumber.replace(/(\d{3})\d{3}(\d{4})/, '$1***$2')
        };

      case 'email':
        mfaData.email = {
          enabled: false,
          setupAt: new Date()
        };
        
        await db.updateUser(userId, { mfaSettings: mfaData });
        
        // Send verification email
        const emailCode = this.generateVerificationCode();
        await this.storeVerificationCode(userId, emailCode, 'email', 'mfa_setup');
        await this.sendEmailCode(user.email, emailCode, 'MFA Setup');
        
        return {
          message: 'Email verification code sent',
          email: user.email.replace(/(.{2}).*(@.*)/, '$1***$2')
        };

      default:
        throw new Error('Invalid MFA method');
    }
  }

  // Verify MFA setup
  async verifyMFASetup(userId, method, code) {
    const db = global.db;
    const user = await db.findUserById(userId);
    
    if (!user || !user.mfaSettings) {
      throw new Error('MFA setup not found');
    }

    let isValid = false;

    switch (method) {
      case 'totp':
        const totpSecret = security.decryptData(user.mfaSettings.totp.secret);
        isValid = this.verifyTOTP(code, totpSecret);
        break;

      case 'sms':
      case 'email':
        const verification = await this.verifyStoredCode(userId, code, 'mfa_setup');
        isValid = verification.success;
        break;

      default:
        throw new Error('Invalid MFA method');
    }

    if (isValid) {
      // Enable MFA method
      const mfaSettings = { ...user.mfaSettings };
      mfaSettings[method].enabled = true;
      mfaSettings[method].verifiedAt = new Date();
      
      await db.updateUser(userId, { 
        mfaSettings,
        mfaEnabled: true
      });

      // Log security event
      security.logSecurityEvent('MFA_ENABLED', {
        userId,
        method,
        timestamp: new Date()
      });

      return {
        success: true,
        message: `${method.toUpperCase()} MFA enabled successfully`
      };
    } else {
      return {
        success: false,
        error: 'Invalid verification code'
      };
    }
  }

  // Challenge MFA during login
  async challengeMFA(userId) {
    const db = global.db;
    const user = await db.findUserById(userId);
    
    if (!user || !user.mfaEnabled || !user.mfaSettings) {
      return {
        required: false,
        message: 'MFA not required'
      };
    }

    const availableMethods = [];
    
    // Check enabled MFA methods
    if (user.mfaSettings.totp?.enabled) {
      availableMethods.push('totp');
    }
    
    if (user.mfaSettings.sms?.enabled) {
      availableMethods.push('sms');
    }
    
    if (user.mfaSettings.email?.enabled) {
      availableMethods.push('email');
    }

    if (availableMethods.length === 0) {
      return {
        required: false,
        message: 'No MFA methods enabled'
      };
    }

    // Generate challenge ID
    const challengeId = security.generateSecureToken();
    
    // Store challenge
    await db.insert('mfa_challenges', {
      challengeId,
      userId,
      availableMethods,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      completed: false
    });

    return {
      required: true,
      challengeId,
      availableMethods,
      message: 'MFA verification required'
    };
  }

  // Verify MFA challenge
  async verifyMFAChallenge(challengeId, method, code) {
    const db = global.db;
    
    // Find challenge
    const challenge = db.findOne('mfa_challenges', {
      challengeId,
      completed: false
    });

    if (!challenge || new Date(challenge.expiresAt) < new Date()) {
      return {
        success: false,
        error: 'Invalid or expired challenge'
      };
    }

    if (!challenge.availableMethods.includes(method)) {
      return {
        success: false,
        error: 'MFA method not available for this challenge'
      };
    }

    const user = await db.findUserById(challenge.userId);
    let isValid = false;

    switch (method) {
      case 'totp':
        const totpSecret = security.decryptData(user.mfaSettings.totp.secret);
        isValid = this.verifyTOTP(code, totpSecret);
        break;

      case 'sms':
      case 'email':
        const verification = await this.verifyStoredCode(challenge.userId, code, 'login');
        isValid = verification.success;
        break;

      default:
        return {
          success: false,
          error: 'Invalid MFA method'
        };
    }

    if (isValid) {
      // Mark challenge as completed
      await db.updateById('mfa_challenges', challenge._id, {
        completed: true,
        completedAt: new Date(),
        method: method
      });

      // Log security event
      security.logSecurityEvent('MFA_VERIFIED', {
        userId: challenge.userId,
        method,
        challengeId,
        timestamp: new Date()
      });

      return {
        success: true,
        userId: challenge.userId,
        message: 'MFA verification successful'
      };
    } else {
      return {
        success: false,
        error: 'Invalid verification code'
      };
    }
  }

  // Generate backup codes
  generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  // Initiate password reset with MFA
  async initiatePasswordReset(email) {
    const db = global.db;
    const user = await db.findUserByEmail(email);
    
    if (!user) {
      // Don't reveal if email exists
      return {
        success: true,
        message: 'If the email exists, a reset code has been sent'
      };
    }

    // Generate reset token
    const resetToken = security.generateSecureToken();
    const resetCode = this.generateVerificationCode(8); // Longer code for password reset
    
    // Store reset request
    await db.insert('password_resets', {
      userId: user._id,
      resetToken,
      resetCode: security.hashSensitiveData(resetCode),
      email: user.email,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      used: false,
      attempts: 0,
      maxAttempts: 3
    });

    // Send reset code via email
    await this.sendEmailCode(user.email, resetCode, 'password_reset');

    // If user has MFA enabled, also send via their preferred method
    if (user.mfaEnabled && user.mfaSettings) {
      if (user.mfaSettings.sms?.enabled) {
        const phoneNumber = security.decryptData(user.mfaSettings.sms.phoneNumber);
        await this.sendSMSCode(phoneNumber, resetCode, 'password_reset');
      }
    }

    // Log security event
    security.logSecurityEvent('PASSWORD_RESET_INITIATED', {
      userId: user._id,
      email: user.email,
      timestamp: new Date()
    });

    return {
      success: true,
      resetToken,
      message: 'Password reset code sent to your email and registered devices'
    };
  }

  // Verify password reset code
  async verifyPasswordResetCode(resetToken, resetCode) {
    const db = global.db;
    
    const resetRequest = db.findOne('password_resets', {
      resetToken,
      used: false
    });

    if (!resetRequest || new Date(resetRequest.expiresAt) < new Date()) {
      return {
        success: false,
        error: 'Invalid or expired reset token'
      };
    }

    // Check attempts
    if (resetRequest.attempts >= resetRequest.maxAttempts) {
      return {
        success: false,
        error: 'Maximum reset attempts exceeded'
      };
    }

    // Verify code
    const hashedCode = security.hashSensitiveData(resetCode);
    const isValid = resetRequest.resetCode === hashedCode;

    // Update attempts
    await db.updateById('password_resets', resetRequest._id, {
      attempts: resetRequest.attempts + 1,
      lastAttemptAt: new Date()
    });

    if (isValid) {
      // Mark as verified
      await db.updateById('password_resets', resetRequest._id, {
        verified: true,
        verifiedAt: new Date()
      });

      return {
        success: true,
        userId: resetRequest.userId,
        resetToken: resetToken
      };
    } else {
      return {
        success: false,
        error: 'Invalid reset code',
        attemptsRemaining: resetRequest.maxAttempts - (resetRequest.attempts + 1)
      };
    }
  }

  // Complete password reset
  async completePasswordReset(resetToken, newPassword) {
    const db = global.db;
    
    const resetRequest = db.findOne('password_resets', {
      resetToken,
      verified: true,
      used: false
    });

    if (!resetRequest || new Date(resetRequest.expiresAt) < new Date()) {
      return {
        success: false,
        error: 'Invalid or expired reset token'
      };
    }

    // Validate new password
    const passwordValidation = security.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return {
        success: false,
        error: `Password validation failed: ${passwordValidation.errors.join(', ')}`
      };
    }

    // Hash new password
    const hashedPassword = await security.hashPassword(newPassword);

    // Update user password
    await db.updateUser(resetRequest.userId, {
      password: hashedPassword,
      passwordChangedAt: new Date(),
      // Invalidate all existing sessions
      tokenVersion: (await db.findUserById(resetRequest.userId)).tokenVersion + 1 || 1
    });

    // Mark reset as used
    await db.updateById('password_resets', resetRequest._id, {
      used: true,
      usedAt: new Date()
    });

    // Log security event
    security.logSecurityEvent('PASSWORD_RESET_COMPLETED', {
      userId: resetRequest.userId,
      timestamp: new Date()
    });

    return {
      success: true,
      message: 'Password reset successfully'
    };
  }

  // Get email subject based on purpose
  getEmailSubject(purpose) {
    switch (purpose) {
      case 'password_reset':
        return `${this.appName} - Password Reset Code`;
      case 'mfa_setup':
        return `${this.appName} - MFA Setup Verification`;
      case 'login':
        return `${this.appName} - Login Verification Code`;
      default:
        return `${this.appName} - Verification Code`;
    }
  }

  // Get email template
  getEmailTemplate(code, purpose) {
    const baseTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #667eea;">${this.appName}</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">${this.getEmailTitle(purpose)}</h2>
          <p style="color: #666; line-height: 1.6;">${this.getEmailMessage(purpose)}</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: #667eea; color: white; padding: 15px 30px; border-radius: 8px; display: inline-block; font-size: 24px; font-weight: bold; letter-spacing: 3px;">
              ${code}
            </div>
          </div>
          
          <p style="color: #999; font-size: 14px; text-align: center;">
            This code will expire in 10 minutes. If you didn't request this, please ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; color: #999; font-size: 12px;">
          <p>&copy; 2024 ${this.appName}. All rights reserved.</p>
        </div>
      </div>
    `;
    
    return baseTemplate;
  }

  // Get email title based on purpose
  getEmailTitle(purpose) {
    switch (purpose) {
      case 'password_reset':
        return 'Password Reset Request';
      case 'mfa_setup':
        return 'Multi-Factor Authentication Setup';
      case 'login':
        return 'Login Verification Required';
      default:
        return 'Verification Required';
    }
  }

  // Get email message based on purpose
  getEmailMessage(purpose) {
    switch (purpose) {
      case 'password_reset':
        return 'You have requested to reset your password. Use the verification code below to complete the process.';
      case 'mfa_setup':
        return 'You are setting up multi-factor authentication for your account. Use the verification code below to complete the setup.';
      case 'login':
        return 'A login attempt was made to your account. Use the verification code below to complete the login process.';
      default:
        return 'Use the verification code below to complete your request.';
    }
  }

  // Disable MFA method
  async disableMFA(userId, method, verificationCode) {
    const db = global.db;
    const user = await db.findUserById(userId);
    
    if (!user || !user.mfaSettings || !user.mfaSettings[method]?.enabled) {
      return {
        success: false,
        error: 'MFA method not found or not enabled'
      };
    }

    // Verify current password or MFA code
    let isValid = false;
    
    if (method === 'totp') {
      const totpSecret = security.decryptData(user.mfaSettings.totp.secret);
      isValid = this.verifyTOTP(verificationCode, totpSecret);
    } else {
      const verification = await this.verifyStoredCode(userId, verificationCode, 'mfa_disable');
      isValid = verification.success;
    }

    if (!isValid) {
      return {
        success: false,
        error: 'Invalid verification code'
      };
    }

    // Disable MFA method
    const mfaSettings = { ...user.mfaSettings };
    mfaSettings[method].enabled = false;
    mfaSettings[method].disabledAt = new Date();

    // Check if any MFA methods are still enabled
    const hasEnabledMFA = Object.values(mfaSettings).some(setting => setting.enabled);

    await db.updateUser(userId, {
      mfaSettings,
      mfaEnabled: hasEnabledMFA
    });

    // Log security event
    security.logSecurityEvent('MFA_DISABLED', {
      userId,
      method,
      timestamp: new Date()
    });

    return {
      success: true,
      message: `${method.toUpperCase()} MFA disabled successfully`
    };
  }
}

module.exports = new MFAService();