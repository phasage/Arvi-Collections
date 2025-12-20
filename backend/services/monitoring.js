const os = require('os');
const process = require('process');
const logger = require('./logger');

class MonitoringService {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        errors: 0,
        averageResponseTime: 0
      },
      system: {
        uptime: 0,
        memory: {},
        cpu: {},
        load: []
      },
      database: {
        connections: 0,
        queries: 0,
        errors: 0
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRate: 0
      }
    };

    this.responseTimes = [];
    this.startTime = Date.now();
    
    // Start monitoring
    this.startSystemMonitoring();
  }

  /**
   * Start system monitoring
   */
  startSystemMonitoring() {
    // Monitor system metrics every 30 seconds
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30000);

    // Log metrics every 5 minutes
    setInterval(() => {
      this.logMetrics();
    }, 300000);
  }

  /**
   * Collect system metrics
   */
  collectSystemMetrics() {
    this.metrics.system = {
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage(),
        system: {
          total: os.totalmem(),
          free: os.freemem(),
          usage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2)
        }
      },
      cpu: {
        usage: process.cpuUsage(),
        load: os.loadavg()
      },
      platform: {
        type: os.type(),
        release: os.release(),
        arch: os.arch(),
        hostname: os.hostname()
      }
    };
  }

  /**
   * Record API request
   */
  recordRequest(method, endpoint, statusCode, responseTime, userId = null) {
    this.metrics.requests.total++;
    
    if (statusCode >= 200 && statusCode < 400) {
      this.metrics.requests.success++;
    } else {
      this.metrics.requests.errors++;
    }

    // Track response times
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000); // Keep last 1000
    }

    // Calculate average response time
    this.metrics.requests.averageResponseTime = 
      this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;

    // Log slow requests
    if (responseTime > 1000) {
      logger.performance('Slow Request', responseTime, {
        method,
        endpoint,
        statusCode,
        userId
      });
    }

    // Log error requests
    if (statusCode >= 400) {
      logger.warn('Error Request', {
        method,
        endpoint,
        statusCode,
        responseTime,
        userId
      });
    }
  }

  /**
   * Record database operation
   */
  recordDatabaseOperation(operation, collection, duration, success = true) {
    this.metrics.database.queries++;
    
    if (!success) {
      this.metrics.database.errors++;
    }

    logger.database(operation, collection, {
      duration: `${duration}ms`,
      success
    });

    // Log slow queries
    if (duration > 500) {
      logger.performance('Slow Database Query', duration, {
        operation,
        collection
      });
    }
  }

  /**
   * Record cache operation
   */
  recordCacheOperation(operation, key, hit = false) {
    if (hit) {
      this.metrics.cache.hits++;
    } else {
      this.metrics.cache.misses++;
    }

    const total = this.metrics.cache.hits + this.metrics.cache.misses;
    this.metrics.cache.hitRate = total > 0 ? 
      (this.metrics.cache.hits / total * 100).toFixed(2) : 0;

    logger.debug('Cache Operation', {
      operation,
      key,
      hit,
      hitRate: this.metrics.cache.hitRate
    });
  }

  /**
   * Record business event
   */
  recordBusinessEvent(event, details = {}) {
    logger.business(event, details);

    // Track specific business metrics
    switch (event) {
      case 'user_registered':
        this.incrementCounter('users.registered');
        break;
      case 'user_login':
        this.incrementCounter('users.logins');
        break;
      case 'product_created':
        this.incrementCounter('products.created');
        break;
      case 'order_placed':
        this.incrementCounter('orders.placed');
        this.recordValue('orders.value', details.total || 0);
        break;
      case 'payment_processed':
        this.incrementCounter('payments.processed');
        this.recordValue('payments.amount', details.amount || 0);
        break;
    }
  }

  /**
   * Increment counter
   */
  incrementCounter(metric, value = 1) {
    if (!this.metrics.counters) {
      this.metrics.counters = {};
    }
    
    if (!this.metrics.counters[metric]) {
      this.metrics.counters[metric] = 0;
    }
    
    this.metrics.counters[metric] += value;
  }

  /**
   * Record value
   */
  recordValue(metric, value) {
    if (!this.metrics.values) {
      this.metrics.values = {};
    }
    
    if (!this.metrics.values[metric]) {
      this.metrics.values[metric] = [];
    }
    
    this.metrics.values[metric].push({
      value,
      timestamp: Date.now()
    });

    // Keep only last 1000 values
    if (this.metrics.values[metric].length > 1000) {
      this.metrics.values[metric] = this.metrics.values[metric].slice(-1000);
    }
  }

  /**
   * Get health status
   */
  getHealthStatus() {
    const memoryUsage = process.memoryUsage();
    const systemMemory = {
      total: os.totalmem(),
      free: os.freemem()
    };

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        process: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
        },
        system: {
          total: `${Math.round(systemMemory.total / 1024 / 1024 / 1024)}GB`,
          free: `${Math.round(systemMemory.free / 1024 / 1024 / 1024)}GB`,
          usage: `${((systemMemory.total - systemMemory.free) / systemMemory.total * 100).toFixed(1)}%`
        }
      },
      cpu: {
        load: os.loadavg(),
        cores: os.cpus().length
      },
      requests: this.metrics.requests,
      database: this.metrics.database,
      cache: this.metrics.cache
    };

    // Determine health status
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    const systemMemoryUsagePercent = ((systemMemory.total - systemMemory.free) / systemMemory.total) * 100;
    const errorRate = this.metrics.requests.total > 0 ? 
      (this.metrics.requests.errors / this.metrics.requests.total) * 100 : 0;

    if (memoryUsagePercent > 90 || systemMemoryUsagePercent > 95 || errorRate > 10) {
      health.status = 'unhealthy';
    } else if (memoryUsagePercent > 70 || systemMemoryUsagePercent > 80 || errorRate > 5) {
      health.status = 'degraded';
    }

    return health;
  }

  /**
   * Get detailed metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      startTime: new Date(this.startTime).toISOString()
    };
  }

  /**
   * Log current metrics
   */
  logMetrics() {
    const health = this.getHealthStatus();
    
    logger.info('System Metrics', {
      status: health.status,
      uptime: health.uptime,
      memory: health.memory,
      requests: health.requests,
      database: health.database,
      cache: health.cache
    });

    // Alert on unhealthy status
    if (health.status === 'unhealthy') {
      logger.warn('System Health Alert', {
        status: health.status,
        memory: health.memory,
        requests: health.requests
      });
    }
  }

  /**
   * Express middleware for request monitoring
   */
  requestMonitoring() {
    return (req, res, next) => {
      const start = Date.now();

      // Override res.end to capture metrics
      const originalEnd = res.end;
      res.end = (chunk, encoding) => {
        const duration = Date.now() - start;
        
        this.recordRequest(
          req.method,
          req.route?.path || req.path,
          res.statusCode,
          duration,
          req.user?.id
        );

        originalEnd.call(res, chunk, encoding);
      };

      next();
    };
  }

  /**
   * Get performance report
   */
  getPerformanceReport() {
    const now = Date.now();
    const last24h = now - (24 * 60 * 60 * 1000);

    return {
      summary: {
        uptime: process.uptime(),
        totalRequests: this.metrics.requests.total,
        successRate: this.metrics.requests.total > 0 ? 
          ((this.metrics.requests.success / this.metrics.requests.total) * 100).toFixed(2) : 0,
        averageResponseTime: this.metrics.requests.averageResponseTime.toFixed(2),
        cacheHitRate: this.metrics.cache.hitRate
      },
      responseTimes: {
        min: Math.min(...this.responseTimes) || 0,
        max: Math.max(...this.responseTimes) || 0,
        avg: this.metrics.requests.averageResponseTime.toFixed(2),
        p95: this.getPercentile(this.responseTimes, 95),
        p99: this.getPercentile(this.responseTimes, 99)
      },
      system: this.metrics.system,
      counters: this.metrics.counters || {},
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculate percentile
   */
  getPercentile(arr, percentile) {
    if (arr.length === 0) return 0;
    
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        errors: 0,
        averageResponseTime: 0
      },
      system: {},
      database: {
        connections: 0,
        queries: 0,
        errors: 0
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRate: 0
      }
    };
    
    this.responseTimes = [];
    logger.info('Metrics reset');
  }
}

// Create singleton instance
const monitoring = new MonitoringService();

module.exports = monitoring;