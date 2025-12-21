const express = require('express');
const { body } = require('express-validator');
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const mfa = require('../services/mfa');
const security = require('../services/security');
const ErrorResponse = require('../utils/errorResponse');

const router = express.Router();

// Apply rate limiting to all MFA routes
router.use(security.getRateLimiters().strict);

// Validation rules
const mfaValidation = {
  setupTOTP: [
    body('method').equals('totp').withMessage('Method must be totp')
  ],
  
  setupSMS: [
    body('method').equals('sms').withMessage('Method must be sms'),
    body('phoneNumber')
      .isMobilePhone()
      .withMessage('Please provide a valid phone number')
  ],
  
  setupEmail: [
    body('method').equals('email').withMessage('Method must be email')
  ],
  
  verifySetup: [
    body('method').isIn(['totp', 'sms', 'email']).withMessage('Invalid MFA method'),
    body('code')
      .isLength({ min: 6, max: 8 })
      .isNumeric()
      .withMessage('Code must be 6-8 digits')
  ],
  
  verifyChallenge: [
    body('challengeId').notEmpty().withMessage('Challenge ID is required'),
    body('method').isIn(['totp', 'sms', 'email']).withMessage('Invalid MFA method'),
    body('code')
      .isLength({ min: 6, max: 8 })
      .isNumeric()
      .withMessage('Code must be 6-8 digits')
  ],
  
  passwordReset: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address')
  ],
  
  verifyReset: [
    body('resetToken').notEmpty().withMessage('Reset token is required'),
    body('resetCode')
      .isLength({ min: 6, max: 8 })
      .isNumeric()
      .withMessage('Reset code must be 6-8 digits')
  ],
  
  completeReset: [
    body('resetToken').notEmpty().withMessage('Reset token is required'),
    body('newPassword')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be between 8 and 128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
      .withMessage('Password must contain uppercase, lowercase, number, and special character')
  ]
};

// @desc    Setup TOTP MFA
// @route   POST /api/mfa/setup/totp
// @access  Private
const setupTOTP = asyncHandler(async (req, res, next) => {
  try {
    const result = await mfa.setupMFA(req.user.id, 'totp');
    
    res.status(200).json({
      success: true,
      message: 'TOTP MFA setup initiated',
      data: {
        qrCode: result.qrCode,
        secret: result.secret,
        backupCodes: result.backupCodes
      }
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Setup SMS MFA
// @route   POST /api/mfa/setup/sms
// @access  Private
const setupSMS = asyncHandler(async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    const result = await mfa.setupMFA(req.user.id, 'sms', { phoneNumber });
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        phoneNumber: result.phoneNumber
      }
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Setup Email MFA
// @route   POST /api/mfa/setup/email
// @access  Private
const setupEmail = asyncHandler(async (req, res, next) => {
  try {
    const result = await mfa.setupMFA(req.user.id, 'email');
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        email: result.email
      }
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Verify MFA setup
// @route   POST /api/mfa/verify-setup
// @access  Private
const verifyMFASetup = asyncHandler(async (req, res, next) => {
  try {
    const { method, code } = req.body;
    const result = await mfa.verifyMFASetup(req.user.id, method, code);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message
      });
    } else {
      return next(new ErrorResponse(result.error, 400));
    }
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Send MFA challenge code
// @route   POST /api/mfa/send-code
// @access  Private
const sendMFACode = asyncHandler(async (req, res, next) => {
  try {
    const { method } = req.body;
    const db = global.db;
    const user = await db.findUserById(req.user.id);
    
    if (!user.mfaEnabled || !user.mfaSettings[method]?.enabled) {
      return next(new ErrorResponse('MFA method not enabled', 400));
    }

    let result;
    const code = mfa.generateVerificationCode();
    
    switch (method) {
      case 'sms':
        const phoneNumber = security.decryptData(user.mfaSettings.sms.phoneNumber);
        result = await mfa.sendSMSCode(phoneNumber, code, 'login');
        break;
        
      case 'email':
        result = await mfa.sendEmailCode(user.email, code, 'login');
        break;
        
      default:
        return next(new ErrorResponse('Invalid MFA method for code sending', 400));
    }

    // Store code for verification
    await mfa.storeVerificationCode(req.user.id, code, method, 'login');

    res.status(200).json({
      success: true,
      message: `Verification code sent via ${method}`,
      data: result
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Verify MFA challenge
// @route   POST /api/mfa/verify-challenge
// @access  Public
const verifyMFAChallenge = asyncHandler(async (req, res, next) => {
  try {
    const { challengeId, method, code } = req.body;
    const result = await mfa.verifyMFAChallenge(challengeId, method, code);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        userId: result.userId
      });
    } else {
      return next(new ErrorResponse(result.error, 400));
    }
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Initiate password reset
// @route   POST /api/mfa/password-reset/initiate
// @access  Public
const initiatePasswordReset = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await mfa.initiatePasswordReset(email);
    
    res.status(200).json({
      success: true,
      message: result.message,
      resetToken: result.resetToken // In production, don't return this
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Verify password reset code
// @route   POST /api/mfa/password-reset/verify
// @access  Public
const verifyPasswordReset = asyncHandler(async (req, res, next) => {
  try {
    const { resetToken, resetCode } = req.body;
    const result = await mfa.verifyPasswordResetCode(resetToken, resetCode);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Reset code verified successfully',
        resetToken: result.resetToken
      });
    } else {
      return next(new ErrorResponse(result.error, 400));
    }
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Complete password reset
// @route   POST /api/mfa/password-reset/complete
// @access  Public
const completePasswordReset = asyncHandler(async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;
    const result = await mfa.completePasswordReset(resetToken, newPassword);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message
      });
    } else {
      return next(new ErrorResponse(result.error, 400));
    }
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Get MFA status
// @route   GET /api/mfa/status
// @access  Private
const getMFAStatus = asyncHandler(async (req, res, next) => {
  try {
    const db = global.db;
    const user = await db.findUserById(req.user.id);
    
    const status = {
      mfaEnabled: user.mfaEnabled || false,
      availableMethods: [],
      enabledMethods: []
    };

    if (user.mfaSettings) {
      Object.keys(user.mfaSettings).forEach(method => {
        status.availableMethods.push(method);
        if (user.mfaSettings[method].enabled) {
          status.enabledMethods.push(method);
        }
      });
    }

    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Disable MFA method
// @route   POST /api/mfa/disable
// @access  Private
const disableMFA = asyncHandler(async (req, res, next) => {
  try {
    const { method, verificationCode } = req.body;
    const result = await mfa.disableMFA(req.user.id, method, verificationCode);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message
      });
    } else {
      return next(new ErrorResponse(result.error, 400));
    }
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

// Routes
router.post('/setup/totp', protect, security.validateInput(mfaValidation.setupTOTP), setupTOTP);
router.post('/setup/sms', protect, security.validateInput(mfaValidation.setupSMS), setupSMS);
router.post('/setup/email', protect, security.validateInput(mfaValidation.setupEmail), setupEmail);
router.post('/verify-setup', protect, security.validateInput(mfaValidation.verifySetup), verifyMFASetup);
router.post('/send-code', protect, sendMFACode);
router.post('/verify-challenge', security.validateInput(mfaValidation.verifyChallenge), verifyMFAChallenge);
router.post('/password-reset/initiate', security.validateInput(mfaValidation.passwordReset), initiatePasswordReset);
router.post('/password-reset/verify', security.validateInput(mfaValidation.verifyReset), verifyPasswordReset);
router.post('/password-reset/complete', security.validateInput(mfaValidation.completeReset), completePasswordReset);
router.get('/status', protect, getMFAStatus);
router.post('/disable', protect, disableMFA);

module.exports = router;