const Redis = require('ioredis');

class CacheService {
  constructor() {
    this.redis = null;
    this.isConnected = false;
    this.init();
  }

  async init() {
    // Check if Redis is enabled
    if (process.env.REDIS_ENABLED === 'false') {
      console.log('📝 Redis disabled in development mode');
      this.isConnected = false;
      return;
    }

    try {
      // Redis configuration
      const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: process.env.REDIS_DB || 0,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        connectTimeout: 5000,
        commandTimeout: 5000
      };

      this.redis = new Redis(redisConfig);

      // Event handlers
      this.redis.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isConnected = true;
      });

      this.redis.on('error', (err) => {
        console.log('⚠️  Redis connection error:', err.message);
        this.isConnected = false;
      });

      this.redis.on('close', () => {
        console.log('🔌 Redis connection closed');
        this.isConnected = false;
      });

      // Test connection
      await this.redis.connect();
      
    } catch (error) {
      console.log('⚠️  Redis not available, caching disabled');
      this.isConnected = false;
    }
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} - Cached value or null
   */
  async get(key) {
    if (!this.isConnected) return null;
    
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (default: 1 hour)
   * @returns {Promise<boolean>} - Success status
   */
  async set(key, value, ttl = 3600) {
    if (!this.isConnected) return false;
    
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete key from cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} - Success status
   */
  async del(key) {
    if (!this.isConnected) return false;
    
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Delete keys by pattern
   * @param {string} pattern - Key pattern (e.g., 'products:*')
   * @returns {Promise<boolean>} - Success status
   */
  async delPattern(pattern) {
    if (!this.isConnected) return false;
    
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return false;
    }
  }

  /**
   * Check if key exists
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} - Existence status
   */
  async exists(key) {
    if (!this.isConnected) return false;
    
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Increment counter
   * @param {string} key - Counter key
   * @param {number} increment - Increment value (default: 1)
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<number>} - New counter value
   */
  async incr(key, increment = 1, ttl = null) {
    if (!this.isConnected) return 0;
    
    try {
      const value = await this.redis.incrby(key, increment);
      if (ttl && value === increment) {
        await this.redis.expire(key, ttl);
      }
      return value;
    } catch (error) {
      console.error('Cache increment error:', error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   * @returns {Promise<object>} - Cache stats
   */
  async getStats() {
    if (!this.isConnected) {
      return { connected: false, message: 'Redis not available' };
    }
    
    try {
      const info = await this.redis.info('memory');
      const keyspace = await this.redis.info('keyspace');
      
      return {
        connected: true,
        memory: info,
        keyspace: keyspace,
        uptime: await this.redis.lastsave()
      };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }

  /**
   * Flush all cache
   * @returns {Promise<boolean>} - Success status
   */
  async flush() {
    if (!this.isConnected) return false;
    
    try {
      await this.redis.flushdb();
      return true;
    } catch (error) {
      console.error('Cache flush error:', error);
      return false;
    }
  }

  /**
   * Close Redis connection
   */
  async close() {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}

// Cache key generators
const CacheKeys = {
  // Products
  products: (filters = {}) => {
    const filterStr = Object.keys(filters)
      .sort()
      .map(key => `${key}:${filters[key]}`)
      .join('|');
    return `products:${filterStr || 'all'}`;
  },
  product: (id) => `product:${id}`,
  productsByCategory: (categoryId) => `products:category:${categoryId}`,
  featuredProducts: () => 'products:featured',
  
  // Categories
  categories: () => 'categories:all',
  category: (id) => `category:${id}`,
  categoryTree: () => 'categories:tree',
  
  // Users
  user: (id) => `user:${id}`,
  users: (filters = {}) => {
    const filterStr = Object.keys(filters)
      .sort()
      .map(key => `${key}:${filters[key]}`)
      .join('|');
    return `users:${filterStr || 'all'}`;
  },
  
  // Orders
  orders: (userId, filters = {}) => {
    const filterStr = Object.keys(filters)
      .sort()
      .map(key => `${key}:${filters[key]}`)
      .join('|');
    return `orders:${userId}:${filterStr || 'all'}`;
  },
  order: (id) => `order:${id}`,
  orderStats: (period) => `orders:stats:${period}`,
  
  // Analytics
  analytics: (type, period) => `analytics:${type}:${period}`,
  
  // Rate limiting
  rateLimit: (ip, endpoint) => `rate_limit:${ip}:${endpoint}`,
  
  // Sessions
  session: (sessionId) => `session:${sessionId}`,
  
  // Search
  search: (query, filters = {}) => {
    const filterStr = Object.keys(filters)
      .sort()
      .map(key => `${key}:${filters[key]}`)
      .join('|');
    return `search:${query}:${filterStr}`;
  }
};

// Cache TTL constants (in seconds)
const CacheTTL = {
  SHORT: 300,      // 5 minutes
  MEDIUM: 1800,    // 30 minutes
  LONG: 3600,      // 1 hour
  VERY_LONG: 86400, // 24 hours
  WEEK: 604800     // 7 days
};

// Create singleton instance
const cacheService = new CacheService();

module.exports = {
  cache: cacheService,
  CacheKeys,
  CacheTTL
};