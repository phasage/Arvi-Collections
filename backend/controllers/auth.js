const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const security = require('../services/security');
const mfa = require('../services/mfa');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'demo-secret-key', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Generate JWT token and set cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified || true
    }
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  const db = global.db;

  // Validate password strength
  const passwordValidation = security.validatePassword(password);
  if (!passwordValidation.isValid) {
    return next(new ErrorResponse(`Password validation failed: ${passwordValidation.errors.join(', ')}`, 400));
  }

  // Sanitize inputs
  const sanitizedName = security.sanitizeInput(name);
  const sanitizedEmail = email.toLowerCase().trim();

  // Validate email format
  if (!security.validateEmail(sanitizedEmail)) {
    return next(new ErrorResponse('Please provide a valid email address', 400));
  }

  // Check if user already exists
  const existingUser = await db.findUserByEmail(sanitizedEmail);
  if (existingUser) {
    // Log security event
    security.logSecurityEvent('DUPLICATE_REGISTRATION_ATTEMPT', {
      email: sanitizedEmail,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    return next(new ErrorResponse('User already exists with this email', 400));
  }

  // Hash password with enhanced security
  const hashedPassword = await security.hashPassword(password);

  // Create user with encrypted sensitive data
  const user = await db.createUser({
    name: sanitizedName,
    email: sanitizedEmail,
    password: hashedPassword,
    role: 'customer',
    isEmailVerified: true, // Auto-verify for demo
    registrationIP: req.ip,
    registrationUserAgent: req.get('User-Agent'),
    lastLogin: new Date(),
    loginAttempts: 0,
    accountLocked: false
  });

  // Log security event
  security.logSecurityEvent('USER_REGISTERED', {
    userId: user._id,
    email: sanitizedEmail,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password, mfaCode, challengeId } = req.body;
  const db = global.db;

  // Detect suspicious activity
  const suspicious = security.detectSuspiciousActivity(req);
  if (suspicious.length > 0) {
    security.logSecurityEvent('SUSPICIOUS_LOGIN_ATTEMPT', {
      email,
      suspicious,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }

  // Sanitize inputs
  const sanitizedEmail = email.toLowerCase().trim();

  // Find user by email
  const user = await db.findUserByEmail(sanitizedEmail);
  if (!user) {
    // Log failed attempt
    security.logSecurityEvent('LOGIN_FAILED', {
      email: sanitizedEmail,
      reason: 'user_not_found',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if account is locked
  if (user.accountLocked && user.lockUntil && new Date() < new Date(user.lockUntil)) {
    security.logSecurityEvent('LOGIN_BLOCKED', {
      userId: user._id,
      reason: 'account_locked',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    return next(new ErrorResponse('Account temporarily locked due to multiple failed attempts', 423));
  }

  // Check password
  const isMatch = await security.verifyPassword(password, user.password);
  if (!isMatch) {
    // Increment failed attempts
    const failedAttempts = (user.loginAttempts || 0) + 1;
    const maxAttempts = 5;
    
    let updateData = {
      loginAttempts: failedAttempts,
      lastFailedLogin: new Date()
    };

    // Lock account after max attempts
    if (failedAttempts >= maxAttempts) {
      updateData.accountLocked = true;
      updateData.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    }

    await db.updateUser(user._id, updateData);

    security.logSecurityEvent('LOGIN_FAILED', {
      userId: user._id,
      email: sanitizedEmail,
      reason: 'invalid_password',
      attempts: failedAttempts,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Reset failed attempts on successful password verification
  await db.updateUser(user._id, {
    loginAttempts: 0,
    accountLocked: false,
    lockUntil: null,
    lastLogin: new Date()
  });

  // Check if MFA is required
  const mfa = require('../services/mfa');
  const mfaChallenge = await mfa.challengeMFA(user._id);

  if (mfaChallenge.required) {
    // If MFA code provided, verify it
    if (mfaCode && challengeId) {
      const mfaResult = await mfa.verifyMFAChallenge(challengeId, 'totp', mfaCode);
      
      if (!mfaResult.success) {
        security.logSecurityEvent('MFA_FAILED', {
          userId: user._id,
          challengeId,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
        return next(new ErrorResponse(mfaResult.error, 401));
      }

      // MFA successful, proceed with login
      security.logSecurityEvent('LOGIN_SUCCESS', {
        userId: user._id,
        email: sanitizedEmail,
        mfaUsed: true,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      sendTokenResponse(user, 200, res);
    } else {
      // Return MFA challenge
      res.status(200).json({
        success: false,
        mfaRequired: true,
        challengeId: mfaChallenge.challengeId,
        availableMethods: mfaChallenge.availableMethods,
        message: 'MFA verification required'
      });
    }
  } else {
    // No MFA required, proceed with login
    security.logSecurityEvent('LOGIN_SUCCESS', {
      userId: user._id,
      email: sanitizedEmail,
      mfaUsed: false,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    sendTokenResponse(user, 200, res);
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
  const db = global.db;
  const user = await db.findUserById(req.user.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address,
      isEmailVerified: user.isEmailVerified,
      preferences: user.preferences,
      lastLogin: user.lastLogin
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res, next) => {
  const db = global.db;
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
    preferences: req.body.preferences
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => {
    if (fieldsToUpdate[key] === undefined) {
      delete fieldsToUpdate[key];
    }
  });

  // Update user
  const user = await db.updateUser(req.user.id, fieldsToUpdate);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address,
      isEmailVerified: user.isEmailVerified,
      preferences: user.preferences
    }
  });
});

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
const updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword, mfaCode } = req.body;
  const db = global.db;
  const user = await db.findUserById(req.user.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Validate new password strength
  const passwordValidation = security.validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    return next(new ErrorResponse(`Password validation failed: ${passwordValidation.errors.join(', ')}`, 400));
  }

  // Check current password
  const isMatch = await security.verifyPassword(currentPassword, user.password);
  if (!isMatch) {
    security.logSecurityEvent('PASSWORD_CHANGE_FAILED', {
      userId: user._id,
      reason: 'invalid_current_password',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    return next(new ErrorResponse('Current password is incorrect', 401));
  }

  // Check if MFA is required for password changes
  if (user.mfaEnabled && user.mfaSettings) {
    if (!mfaCode) {
      return next(new ErrorResponse('MFA verification required for password changes', 400));
    }

    // Verify MFA code (assuming TOTP for simplicity, can be extended)
    let mfaValid = false;
    if (user.mfaSettings.totp?.enabled) {
      const totpSecret = security.decryptData(user.mfaSettings.totp.secret);
      mfaValid = mfa.verifyTOTP(mfaCode, totpSecret);
    }

    if (!mfaValid) {
      security.logSecurityEvent('PASSWORD_CHANGE_FAILED', {
        userId: user._id,
        reason: 'invalid_mfa',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      return next(new ErrorResponse('Invalid MFA code', 401));
    }
  }

  // Hash new password with enhanced security
  const hashedPassword = await security.hashPassword(newPassword);

  // Update password
  const updatedUser = await db.updateUser(req.user.id, { 
    password: hashedPassword,
    passwordChangedAt: new Date()
  });

  // Log security event
  security.logSecurityEvent('PASSWORD_CHANGED', {
    userId: user._id,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  sendTokenResponse(updatedUser, 200, res);
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  
  // Sanitize email input
  const sanitizedEmail = email.toLowerCase().trim();
  
  // Validate email format
  if (!security.validateEmail(sanitizedEmail)) {
    return next(new ErrorResponse('Please provide a valid email address', 400));
  }

  // Use MFA service for secure password reset
  const result = await mfa.initiatePasswordReset(sanitizedEmail);

  res.status(200).json({
    success: true,
    message: result.message,
    resetToken: result.resetToken // In production, don't return this
  });
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
  const { resetCode, newPassword } = req.body;
  const { token: resetToken } = req.params;

  if (!resetToken || !resetCode || !newPassword) {
    return next(new ErrorResponse('Reset token, reset code, and new password are required', 400));
  }

  // Verify reset code using MFA service
  const verification = await mfa.verifyPasswordResetCode(resetToken, resetCode);
  
  if (!verification.success) {
    return next(new ErrorResponse(verification.error, 400));
  }

  // Complete password reset
  const result = await mfa.completePasswordReset(resetToken, newPassword);
  
  if (!result.success) {
    return next(new ErrorResponse(result.error, 400));
  }

  // Get updated user and send token response
  const db = global.db;
  const updatedUser = await db.findUserById(verification.userId);
  
  sendTokenResponse(updatedUser, 200, res);
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res, next) => {
  const db = global.db;
  
  // In file database, we'll auto-verify for simplicity
  res.status(200).json({
    success: true,
    message: 'Email verified successfully'
  });
});

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = asyncHandler(async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return next(new ErrorResponse('No token provided', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret-key');
    const db = global.db;
    const user = await db.findUserById(decoded.id);

    if (!user) {
      return next(new ErrorResponse('No user found with this token', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    return next(new ErrorResponse('Invalid token', 401));
  }
});

// @desc    SSO Login
// @route   POST /api/auth/sso/:provider
// @access  Public
const ssoLogin = asyncHandler(async (req, res, next) => {
  const { provider } = req.params;
  const { profile } = req.body;

  if (!['google', 'facebook', 'github'].includes(provider)) {
    return next(new ErrorResponse('Invalid SSO provider', 400));
  }

  const db = global.db;

  // Mock profile data
  const mockProfile = {
    email: profile?.email || `user@${provider}.com`,
    name: profile?.name || `${provider} User`,
    avatar: profile?.avatar || null
  };

  // Sanitize inputs
  const sanitizedEmail = mockProfile.email.toLowerCase().trim();
  const sanitizedName = security.sanitizeInput(mockProfile.name);

  // Validate email format
  if (!security.validateEmail(sanitizedEmail)) {
    return next(new ErrorResponse('Invalid email from SSO provider', 400));
  }

  // Check if user exists
  let user = await db.findUserByEmail(sanitizedEmail);

  if (!user) {
    // Create new user with secure password
    const securePassword = security.generateSecurePassword(32);
    const hashedPassword = await security.hashPassword(securePassword);
    
    user = await db.createUser({
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashedPassword,
      isEmailVerified: true,
      avatar: mockProfile.avatar,
      role: 'customer',
      ssoProvider: provider,
      registrationIP: req.ip,
      registrationUserAgent: req.get('User-Agent'),
      lastLogin: new Date()
    });

    // Log security event
    security.logSecurityEvent('SSO_USER_CREATED', {
      userId: user._id,
      provider,
      email: sanitizedEmail,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  } else {
    // Update last login
    await db.updateUser(user._id, {
      lastLogin: new Date(),
      ssoProvider: provider
    });

    // Log security event
    security.logSecurityEvent('SSO_LOGIN_SUCCESS', {
      userId: user._id,
      provider,
      email: sanitizedEmail,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }

  sendTokenResponse(user, 200, res);
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  refreshToken,
  ssoLogin
};