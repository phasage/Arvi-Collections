const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const CryptoJS = require('crypto-js');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

class SecurityService {
  constructor() {
    // Generate or use existing encryption key
    this.encryptionKey = process.env.ENCRYPTION_KEY || this.generateEncryptionKey();
    this.saltRounds = 12; // Higher than default for better security
    
    // Security configurations
    this.passwordPolicy = {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxLength: 128
    };
    
    // Rate limiting configurations
    this.rateLimits = {
      auth: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // 5 attempts per window
        message: {
          error: 'Too many authentication attempts, please try again later',
          retryAfter: '15 minutes'
        },
        standardHeaders: true,
        legacyHeaders: false,
      }),
      
      api: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // 100 requests per window
        message: {
          error: 'Too many requests, please try again later'
        },
        standardHeaders: true,
        legacyHeaders: false,
      }),
      
      strict: rateLimit({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 3, // 3 attempts per hour for sensitive operations
        message: {
          error: 'Too many sensitive operations, please try again later',
          retryAfter: '1 hour'
        }
      })
    };
  }

  // Generate a secure encryption key
  generateEncryptionKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Advanced password hashing with Argon2-like security using bcrypt
  async hashPassword(password) {
    try {
      // Add pepper (application-wide secret)
      const pepper = process.env.PASSWORD_PEPPER || 'arvi-collection-pepper-2024';
      const pepperedPassword = password + pepper;
      
      // Generate salt and hash
      const salt = await bcrypt.genSalt(this.saltRounds);
      const hash = await bcrypt.hash(pepperedPassword, salt);
      
      return hash;
    } catch (error) {
      throw new Error('Password hashing failed');
    }
  }

  // Verify password with pepper
  async verifyPassword(password, hash) {
    try {
      const pepper = process.env.PASSWORD_PEPPER || 'arvi-collection-pepper-2024';
      const pepperedPassword = password + pepper;
      
      return await bcrypt.compare(pepperedPassword, hash);
    } catch (error) {
      return false;
    }
  }

  // Encrypt sensitive data (PII, addresses, etc.)
  encryptData(data) {
    try {
      if (!data) return null;
      
      const dataString = typeof data === 'object' ? JSON.stringify(data) : String(data);
      const encrypted = CryptoJS.AES.encrypt(dataString, this.encryptionKey).toString();
      
      return encrypted;
    } catch (error) {
      throw new Error('Data encryption failed');
    }
  }

  // Decrypt sensitive data
  decryptData(encryptedData) {
    try {
      if (!encryptedData) return null;
      
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      
      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(decryptedString);
      } catch {
        return decryptedString;
      }
    } catch (error) {
      throw new Error('Data decryption failed');
    }
  }

  // Generate secure tokens
  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Generate cryptographically secure random passwords
  generateSecurePassword(length = 16) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      password += charset[randomIndex];
    }
    
    return password;
  }

  // Validate password strength
  validatePassword(password) {
    const errors = [];
    
    if (!password) {
      errors.push('Password is required');
      return { isValid: false, errors };
    }
    
    if (password.length < this.passwordPolicy.minLength) {
      errors.push(`Password must be at least ${this.passwordPolicy.minLength} characters long`);
    }
    
    if (password.length > this.passwordPolicy.maxLength) {
      errors.push(`Password must not exceed ${this.passwordPolicy.maxLength} characters`);
    }
    
    if (this.passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (this.passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (this.passwordPolicy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (this.passwordPolicy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    // Check for common weak patterns
    const weakPatterns = [
      /(.)\1{2,}/, // Repeated characters (aaa, 111)
      /123456|654321|qwerty|password|admin/i, // Common sequences
      /^[a-z]+$|^[A-Z]+$|^\d+$/, // Single character type
    ];
    
    for (const pattern of weakPatterns) {
      if (pattern.test(password)) {
        errors.push('Password contains weak patterns');
        break;
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      strength: this.calculatePasswordStrength(password)
    };
  }

  // Calculate password strength score
  calculatePasswordStrength(password) {
    let score = 0;
    
    // Length bonus
    score += Math.min(password.length * 2, 20);
    
    // Character variety bonus
    if (/[a-z]/.test(password)) score += 5;
    if (/[A-Z]/.test(password)) score += 5;
    if (/\d/.test(password)) score += 5;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 10;
    
    // Complexity bonus
    const uniqueChars = new Set(password).size;
    score += uniqueChars * 2;
    
    // Penalty for common patterns
    if (/(.)\1{2,}/.test(password)) score -= 10;
    if (/123456|654321|qwerty|password|admin/i.test(password)) score -= 20;
    
    // Normalize to 0-100 scale
    score = Math.max(0, Math.min(100, score));
    
    if (score >= 80) return 'very-strong';
    if (score >= 60) return 'strong';
    if (score >= 40) return 'medium';
    if (score >= 20) return 'weak';
    return 'very-weak';
  }

  // Sanitize input data
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/[<>]/g, ''); // Remove angle brackets
  }

  // Validate email format
  validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  }

  // Generate CSRF token
  generateCSRFToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Validate CSRF token
  validateCSRFToken(token, sessionToken) {
    return crypto.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(sessionToken, 'hex')
    );
  }

  // Hash sensitive data for comparison (one-way)
  hashSensitiveData(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Secure session data
  encryptSessionData(sessionData) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    
    let encrypted = cipher.update(JSON.stringify(sessionData), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      iv: iv.toString('hex'),
      data: encrypted
    };
  }

  // Decrypt session data
  decryptSessionData(encryptedSession) {
    try {
      const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
      
      let decrypted = decipher.update(encryptedSession.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      return null;
    }
  }

  // Input validation middleware
  validateInput(validationRules) {
    return [
      ...validationRules,
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
          });
        }
        next();
      }
    ];
  }

  // Common validation rules
  getValidationRules() {
    return {
      email: body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address')
        .isLength({ max: 254 })
        .withMessage('Email address too long'),
        
      password: body('password')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
        .withMessage('Password must contain uppercase, lowercase, number, and special character'),
        
      name: body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
        
      phone: body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
        
      price: body('price')
        .isFloat({ min: 0, max: 999999.99 })
        .withMessage('Price must be a valid amount'),
        
      quantity: body('quantity')
        .isInt({ min: 1, max: 10000 })
        .withMessage('Quantity must be between 1 and 10000')
    };
  }

  // Security headers middleware
  getSecurityHeaders() {
    return (req, res, next) => {
      // Content Security Policy
      res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline'; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https: http:; " +
        "connect-src 'self' https: http:;"
      );
      
      // Security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
      
      // Remove server information
      res.removeHeader('X-Powered-By');
      
      next();
    };
  }

  // Audit log for security events
  logSecurityEvent(event, details = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      ip: details.ip || 'unknown',
      userAgent: details.userAgent || 'unknown'
    };
    
    // In production, send to security monitoring service
    console.log('🔒 Security Event:', JSON.stringify(logEntry, null, 2));
    
    return logEntry;
  }

  // Check for suspicious activity
  detectSuspiciousActivity(req) {
    const suspicious = [];
    
    // Check for SQL injection patterns
    const sqlPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)|('|(\\x27)|(\\x2D\\x2D))/i;
    const queryString = JSON.stringify(req.query) + JSON.stringify(req.body);
    
    if (sqlPatterns.test(queryString)) {
      suspicious.push('Potential SQL injection attempt');
    }
    
    // Check for XSS patterns
    const xssPatterns = /<script|javascript:|on\w+\s*=/i;
    if (xssPatterns.test(queryString)) {
      suspicious.push('Potential XSS attempt');
    }
    
    // Check for unusual user agents
    const userAgent = req.get('User-Agent') || '';
    if (userAgent.length > 500 || /bot|crawler|spider/i.test(userAgent)) {
      suspicious.push('Suspicious user agent');
    }
    
    return suspicious;
  }

  // Rate limiting middleware
  getRateLimiters() {
    return this.rateLimits;
  }
}

module.exports = new SecurityService();