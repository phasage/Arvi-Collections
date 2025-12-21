// Network Utilities for Production
import { API_BASE, API_TIMEOUT } from '../config/api';
import { handleApiError, logError } from './errorHandler';

// Enhanced fetch with timeout, retry, and error handling
export const apiRequest = async (endpoint, options = {}) => {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = API_TIMEOUT,
    retries = 3,
    retryDelay = 1000,
    ...otherOptions
  } = options;

  const url = `${API_BASE}${endpoint}`;
  
  const requestOptions = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...otherOptions,
  };

  if (body && method !== 'GET') {
    requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  // Create timeout promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), timeout);
  });

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await Promise.race([
        fetch(url, requestOptions),
        timeoutPromise
      ]);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP ${response.status}`);
        error.statusCode = response.status;
        throw error;
      }

      const data = await response.json();
      return data;

    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx) except 408 (timeout)
      if (error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 408) {
        break;
      }

      // Don't retry on the last attempt
      if (attempt === retries) {
        break;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
    }
  }

  const handledError = handleApiError(lastError);
  logError(handledError, { endpoint, method, attempt: retries + 1 });
  throw handledError;
};

// Authenticated API request
export const authenticatedRequest = async (endpoint, options = {}, token) => {
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  return apiRequest(endpoint, { ...options, headers });
};

// File upload utility
export const uploadFile = async (endpoint, file, token, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type for FormData, let browser set it with boundary
    },
    body: formData,
  };

  // Add progress tracking if supported
  if (onProgress && typeof onProgress === 'function') {
    // This would require a custom implementation or library like axios
    // For now, we'll use basic fetch
  }

  return apiRequest(endpoint, options);
};

// Network status checker
export const checkNetworkStatus = async () => {
  try {
    const response = await fetch(`${API_BASE}/health`, {
      method: 'HEAD',
      timeout: 5000,
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Batch requests utility
export const batchRequests = async (requests, maxConcurrent = 3) => {
  const results = [];
  const errors = [];

  for (let i = 0; i < requests.length; i += maxConcurrent) {
    const batch = requests.slice(i, i + maxConcurrent);
    
    const batchPromises = batch.map(async (request, index) => {
      try {
        const result = await apiRequest(request.endpoint, request.options);
        return { index: i + index, result, success: true };
      } catch (error) {
        return { index: i + index, error, success: false };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    
    batchResults.forEach(({ index, result, error, success }) => {
      if (success) {
        results[index] = result;
      } else {
        errors[index] = error;
      }
    });
  }

  return { results, errors };
};

// Cache utility for API responses
class ApiCache {
  constructor(maxSize = 100, ttl = 5 * 60 * 1000) { // 5 minutes default TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key, data) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      expiry: Date.now() + this.ttl,
    });
  }

  clear() {
    this.cache.clear();
  }
}

export const apiCache = new ApiCache();

// Cached API request
export const cachedApiRequest = async (endpoint, options = {}, cacheKey = null) => {
  const key = cacheKey || `${endpoint}_${JSON.stringify(options)}`;
  
  // Only cache GET requests
  if (options.method && options.method !== 'GET') {
    return apiRequest(endpoint, options);
  }

  const cached = apiCache.get(key);
  if (cached) {
    return cached;
  }

  const result = await apiRequest(endpoint, options);
  apiCache.set(key, result);
  
  return result;
};