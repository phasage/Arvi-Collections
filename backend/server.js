const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Setup DOMPurify for server-side use
const window = new JSDOM('').window;
const purify = DOMPurify(window);
const hpp = require('hpp');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
require('dotenv').config();

// Import services
const logger = require('./services/logger');
const monitoring = require('./services/monitoring');
const { cache } = require('./services/cache');
const imageService = require('./services/imageService');
const DatabaseService = require('./services/database');

// Import Swagger
const { swaggerUi, specs } = require('./swagger');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const mfaRoutes = require('./routes/mfa');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https:", "http:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.'
  }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL,
      'http://localhost:3000',
      'http://localhost:5173',
      'https://arvis-collection.vercel.app'
    ];
    
    // Allow requests with no origin (like mobile apps, Postman, or file:// protocol)
    if (!origin) {
      console.log('CORS allowing request with no origin (file:// protocol)');
      callback(null, true);
      return;
    }
    
    // Allow any localhost origin for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      console.log('CORS allowing localhost origin:', origin);
      callback(null, true);
      return;
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log('CORS allowing whitelisted origin:', origin);
      callback(null, true);
    } else {
      console.log('CORS allowing origin (demo mode):', origin);
      callback(null, true); // Allow all origins in demo mode
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
// Use simple CORS for demo mode
app.use(cors({
  origin: true, // Allow all origins in demo mode
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS - handled in middleware
app.use((req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  next();
});

// XSS sanitization function
function sanitizeObject(obj) {
  if (typeof obj === 'string') {
    return purify.sanitize(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  if (typeof obj === 'object' && obj !== null) {
    const sanitized = {};
    for (const key in obj) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }
  return obj;
}

// Prevent parameter pollution
app.use(hpp({
  whitelist: ['sort', 'fields', 'page', 'limit', 'category', 'price']
}));

// Compression middleware
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev', { stream: logger.getStream() }));
} else {
  app.use(morgan('combined', { stream: logger.getStream() }));
}

// Request monitoring middleware
app.use(monitoring.requestMonitoring());
app.use(logger.requestLogger());

// Initialize database service
const db = new DatabaseService();
global.db = db; // Make database available globally

// Connect to database (File Database + MongoDB fallback)
const connectDB = async () => {
  try {
    // Always use file database as primary
    await db.connect();
    logger.info('File database initialized successfully');
    
    // Try MongoDB as secondary (optional)
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/arvis-collection';
    
    try {
      await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      });
      logger.info('MongoDB connected as secondary database', { uri: mongoURI });
      global.mongoConnected = true;
    } catch (mongoErr) {
      logger.warn('MongoDB not available, using file database only', { error: mongoErr.message });
      global.mongoConnected = false;
    }
    
    return true;
  } catch (err) {
    logger.error('Database initialization failed', { error: err.message });
    return false;
  }
};

connectDB().then(async (connected) => {
  // Log startup information
  logger.info('Server initialization completed', {
    database: 'file database',
    mongodb: global.mongoConnected ? 'connected' : 'not available',
    redis: cache.isConnected ? 'connected' : 'not available',
    cloudinary: imageService.isCloudinaryConfigured ? 'configured' : 'local storage',
    environment: process.env.NODE_ENV
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  const health = monitoring.getHealthStatus();
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
    uptime: process.uptime(),
    database: {
      status: 'connected',
      mode: 'File Database',
      mongodb: global.mongoConnected ? 'connected' : 'not available'
    },
    cache: {
      status: cache.isConnected ? 'connected' : 'not available',
      hitRate: health.cache.hitRate
    },
    imageService: {
      status: imageService.isCloudinaryConfigured ? 'cloudinary' : 'local storage'
    },
    performance: {
      averageResponseTime: health.requests.averageResponseTime,
      totalRequests: health.requests.total,
      errorRate: health.requests.total > 0 ? 
        ((health.requests.errors / health.requests.total) * 100).toFixed(2) : 0
    }
  });
});

// Metrics endpoint
app.get('/api/metrics', (req, res) => {
  const metrics = monitoring.getMetrics();
  res.status(200).json({
    success: true,
    data: metrics
  });
});

// Performance report endpoint
app.get('/api/performance', (req, res) => {
  const report = monitoring.getPerformanceReport();
  res.status(200).json({
    success: true,
    data: report
  });
});

// Cache stats endpoint
app.get('/api/cache/stats', async (req, res) => {
  const stats = await cache.getStats();
  res.status(200).json({
    success: true,
    data: stats
  });
});

// Image service status endpoint
app.get('/api/images/status', (req, res) => {
  const status = imageService.getStatus();
  res.status(200).json({
    success: true,
    data: status
  });
});

// Swagger API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Arvi's Collection API Documentation",
  swaggerOptions: {
    docExpansion: 'none',
    filter: true,
    showRequestHeaders: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  }
}));

// Redirect /api to docs
app.get('/api', (req, res) => {
  res.redirect('/api/docs');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/mfa', mfaRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('public'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
  });
}

// Error handling middleware
app.use(logger.errorLogger());
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV,
    pid: process.pid
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Rejection', {
    error: err.message,
    stack: err.stack
  });
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
    // Close database connections
    mongoose.connection.close();
    // Close cache connection
    cache.close();
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
    // Close database connections
    mongoose.connection.close();
    // Close cache connection
    cache.close();
  });
});

module.exports = app;