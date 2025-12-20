const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta, null, 2)}`;
    }
    return msg;
  })
);

// Create transports
const transports = [];

// Console transport for development
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: 'debug'
    })
  );
}

// File transports
transports.push(
  // Error logs
  new DailyRotateFile({
    filename: path.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    format: logFormat,
    maxSize: '20m',
    maxFiles: '14d',
    zippedArchive: true
  }),

  // Combined logs
  new DailyRotateFile({
    filename: path.join(logsDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    format: logFormat,
    maxSize: '20m',
    maxFiles: '14d',
    zippedArchive: true
  }),

  // HTTP access logs
  new DailyRotateFile({
    filename: path.join(logsDir, 'access-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'http',
    format: logFormat,
    maxSize: '20m',
    maxFiles: '30d',
    zippedArchive: true
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'arvis-collection-api',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  transports,
  exitOnError: false
});

// Custom logging methods
class Logger {
  constructor(winstonLogger) {
    this.winston = winstonLogger;
  }

  // Standard log levels
  error(message, meta = {}) {
    this.winston.error(message, meta);
  }

  warn(message, meta = {}) {
    this.winston.warn(message, meta);
  }

  info(message, meta = {}) {
    this.winston.info(message, meta);
  }

  debug(message, meta = {}) {
    this.winston.debug(message, meta);
  }

  // HTTP request logging
  http(message, meta = {}) {
    this.winston.http(message, meta);
  }

  // Application-specific logging methods
  auth(action, userId, meta = {}) {
    this.winston.info(`AUTH: ${action}`, {
      userId,
      action,
      category: 'authentication',
      ...meta
    });
  }

  security(event, details = {}) {
    this.winston.warn(`SECURITY: ${event}`, {
      event,
      category: 'security',
      ...details
    });
  }

  performance(operation, duration, meta = {}) {
    this.winston.info(`PERFORMANCE: ${operation}`, {
      operation,
      duration: `${duration}ms`,
      category: 'performance',
      ...meta
    });
  }

  database(operation, collection, meta = {}) {
    this.winston.debug(`DB: ${operation} on ${collection}`, {
      operation,
      collection,
      category: 'database',
      ...meta
    });
  }

  api(method, endpoint, statusCode, responseTime, meta = {}) {
    const level = statusCode >= 400 ? 'warn' : 'http';
    this.winston[level](`API: ${method} ${endpoint}`, {
      method,
      endpoint,
      statusCode,
      responseTime: `${responseTime}ms`,
      category: 'api',
      ...meta
    });
  }

  business(event, details = {}) {
    this.winston.info(`BUSINESS: ${event}`, {
      event,
      category: 'business',
      ...details
    });
  }

  // Error logging with context
  logError(error, context = {}) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      category: 'error',
      ...context
    };

    if (error.statusCode && error.statusCode < 500) {
      this.winston.warn('Client Error', errorInfo);
    } else {
      this.winston.error('Server Error', errorInfo);
    }
  }

  // Request logging middleware
  requestLogger() {
    return (req, res, next) => {
      const start = Date.now();
      
      // Log request
      this.http('Request started', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id
      });

      // Override res.end to log response
      const originalEnd = res.end;
      res.end = (chunk, encoding) => {
        const duration = Date.now() - start;
        
        // Use the correct logger instance
        const level = res.statusCode >= 400 ? 'warn' : 'http';
        this.winston[level](`API: ${req.method} ${req.url}`, {
          method: req.method,
          endpoint: req.url,
          statusCode: res.statusCode,
          responseTime: `${duration}ms`,
          category: 'api',
          ip: req.ip,
          userId: req.user?.id,
          contentLength: res.get('Content-Length')
        });

        originalEnd.call(this, chunk, encoding);
      };

      next();
    };
  }

  // Error logging middleware
  errorLogger() {
    return (error, req, res, next) => {
      this.logError(error, {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userId: req.user?.id,
        body: req.body,
        params: req.params,
        query: req.query
      });

      next(error);
    };
  }

  // Stream for Morgan HTTP logger
  getStream() {
    return {
      write: (message) => {
        this.winston.http(message.trim());
      }
    };
  }
}

// Create logger instance
const appLogger = new Logger(logger);

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  appLogger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  appLogger.error('Unhandled Rejection', {
    reason: reason?.message || reason,
    stack: reason?.stack,
    promise: promise.toString()
  });
});

// Graceful shutdown logging
process.on('SIGTERM', () => {
  appLogger.info('SIGTERM received, shutting down gracefully');
});

process.on('SIGINT', () => {
  appLogger.info('SIGINT received, shutting down gracefully');
});

module.exports = appLogger;