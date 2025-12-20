const crypto = require('node:crypto');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

// Generate JWT token and set cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
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
      isEmailVerified: user.isEmailVerified
    }
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (global.demoMode) {
    // Demo mode - use in-memory data
    const bcrypt = require('bcryptjs');
    
    // Check if user already exists
    const existingUser = global.demoData.users.find(u => u.email === email);
    if (existingUser) {
      return next(new ErrorResponse('User already exists with this email', 400));
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = {
      _id: String(global.demoData.users.length + 1),
      name,
      email,
      password: hashedPassword,
      role: 'user',
      isEmailVerified: true, // Auto-verify in demo mode
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      getSignedJwtToken: function() {
        const jwt = require('jsonwebtoken');
        return jwt.sign(
          { 
            id: this._id,
            email: this.email,
            role: this.role
          },
          process.env.JWT_SECRET || 'demo-secret-key',
          { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );
      }
    };

    global.demoData.users.push(newUser);
    sendTokenResponse(newUser, 201, res);
    return;
  }

  // MongoDB mode
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorResponse('User already exists with this email', 400));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password
  });

  // Generate email verification token
  const verificationToken = user.getEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Send verification email
  try {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    
    await sendEmail({
      email: user.email,
      subject: 'Email Verification - Arvi\'s Collection',
      template: 'emailVerification',
      data: {
        name: user.name,
        verificationUrl
      }
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error('Email sending failed:', err);
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 201, res);
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  try {
    let user;
    
    if (global.demoMode) {
      // Demo mode - use in-memory data
      const bcrypt = require('bcryptjs');
      const demoUser = global.demoData.users.find(u => u.email === email && u.isActive);
      
      if (!demoUser) {
        return next(new ErrorResponse('Invalid credentials', 401));
      }
      
      const isMatch = await bcrypt.compare(password, demoUser.password);
      if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
      }
      
      user = {
        _id: demoUser._id,
        name: demoUser.name,
        email: demoUser.email,
        role: demoUser.role,
        isEmailVerified: demoUser.isEmailVerified,
        getSignedJwtToken: function() {
          const jwt = require('jsonwebtoken');
          return jwt.sign(
            { 
              id: this._id,
              email: this.email,
              role: this.role
            },
            process.env.JWT_SECRET || 'demo-secret-key',
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
          );
        }
      };
    } else {
      // MongoDB mode
      user = await User.findByCredentials(email, password);
    }
    
    sendTokenResponse(user, 200, res);
  } catch (error) {
    return next(new ErrorResponse(error.message, 401));
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
  const user = await User.findById(req.user.id);

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

  // If email is being updated, require email verification
  if (req.body.email && req.body.email !== req.user.email) {
    fieldsToUpdate.isEmailVerified = false;
    
    const user = await User.findById(req.user.id);
    const verificationToken = user.getEmailVerificationToken();
    fieldsToUpdate.emailVerificationToken = user.emailVerificationToken;
    fieldsToUpdate.emailVerificationExpire = user.emailVerificationExpire;

    // Send verification email
    try {
      const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
      
      await sendEmail({
        email: req.body.email,
        subject: 'Email Verification - Arvi\'s Collection',
        template: 'emailVerification',
        data: {
          name: fieldsToUpdate.name || req.user.name,
          verificationUrl
        }
      });
    } catch (err) {
      console.error('Email sending failed:', err);
    }
  }

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

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
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Current password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset - Arvi\'s Collection',
      template: 'passwordReset',
      data: {
        name: user.name,
        resetUrl
      }
    });

    res.status(200).json({
      success: true,
      message: 'Email sent'
    });
  } catch (err) {
    console.error('Email sending failed:', err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const emailVerificationToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    emailVerificationToken,
    emailVerificationExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Update user
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save();

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

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
  const { token, profile } = req.body;

  // In a real implementation, you would verify the token with the provider
  // For demo purposes, we'll create a mock verification
  
  if (!['google', 'facebook', 'github'].includes(provider)) {
    return next(new ErrorResponse('Invalid SSO provider', 400));
  }

  // Mock profile data (in real implementation, get from provider)
  const mockProfile = {
    id: `${provider}_${Date.now()}`,
    email: profile?.email || `user@${provider}.com`,
    name: profile?.name || `${provider} User`,
    avatar: profile?.avatar || null
  };

  // Check if user exists with this email
  let user = await User.findOne({ email: mockProfile.email });

  if (user) {
    // Update social login info
    user.socialLogins[provider] = {
      id: mockProfile.id,
      email: mockProfile.email
    };
    user.lastLogin = new Date();
    await user.save();
  } else {
    // Create new user
    user = await User.create({
      name: mockProfile.name,
      email: mockProfile.email,
      password: crypto.randomBytes(20).toString('hex'), // Random password
      isEmailVerified: true, // SSO emails are pre-verified
      avatar: mockProfile.avatar ? { url: mockProfile.avatar } : undefined,
      socialLogins: {
        [provider]: {
          id: mockProfile.id,
          email: mockProfile.email
        }
      }
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