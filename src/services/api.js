import axios from 'axios'
import DOMPurify from 'dompurify'

// API Base URL - In production, this should come from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add auth token and sanitize data
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      try {
        const { token } = JSON.parse(authStorage).state
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      } catch (error) {
        console.error('Error parsing auth storage:', error)
      }
    }
    
    // Sanitize request data
    if (config.data) {
      config.data = sanitizeData(config.data)
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // Try to refresh token
        const response = await apiClient.post('/auth/refresh')
        const { token } = response.data
        
        // Update token in storage
        const authStorage = JSON.parse(localStorage.getItem('auth-storage'))
        authStorage.state.token = token
        localStorage.setItem('auth-storage', JSON.stringify(authStorage))
        
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${token}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('auth-storage')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

// Sanitize data to prevent XSS attacks
const sanitizeData = (data) => {
  if (typeof data === 'string') {
    return DOMPurify.sanitize(data)
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item))
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized = {}
    for (const key in data) {
      sanitized[key] = sanitizeData(data[key])
    }
    return sanitized
  }
  
  return data
}

// Auth API
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  logout: () => apiClient.post('/auth/logout'),
  refreshToken: () => apiClient.post('/auth/refresh'),
  ssoLogin: (provider, token) => apiClient.post(`/auth/sso/${provider}`, { token }),
  updateProfile: (userData) => apiClient.put('/auth/profile', userData),
  changePassword: (passwords) => apiClient.put('/auth/password', passwords),
}

// Products API
export const productsAPI = {
  getAll: (params) => apiClient.get('/products', { params }),
  getById: (id) => apiClient.get(`/products/${id}`),
  create: (productData) => apiClient.post('/products', productData),
  update: (id, productData) => apiClient.put(`/products/${id}`, productData),
  delete: (id) => apiClient.delete(`/products/${id}`),
  search: (query) => apiClient.get('/products/search', { params: { q: query } }),
}

// Orders API
export const ordersAPI = {
  create: (orderData) => apiClient.post('/orders', orderData),
  getAll: () => apiClient.get('/orders'),
  getById: (id) => apiClient.get(`/orders/${id}`),
  updateStatus: (id, status) => apiClient.patch(`/orders/${id}/status`, { status }),
}

// Categories API
export const categoriesAPI = {
  getAll: () => apiClient.get('/categories'),
  getById: (id) => apiClient.get(`/categories/${id}`),
}

// Mock API for development (remove in production)
export const mockAPI = {
  // Mock login
  login: async (credentials) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (credentials.email === 'admin@arvis.com' && credentials.password === 'admin123') {
      return {
        data: {
          token: 'mock-jwt-token-admin',
          user: {
            id: 1,
            name: 'Admin User',
            email: 'admin@arvis.com',
            role: 'admin'
          }
        }
      }
    }
    
    if (credentials.email && credentials.password) {
      return {
        data: {
          token: 'mock-jwt-token-user',
          user: {
            id: 2,
            name: 'John Doe',
            email: credentials.email,
            role: 'user'
          }
        }
      }
    }
    
    throw new Error('Invalid credentials')
  },
  
  // Mock register
  register: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      data: {
        token: 'mock-jwt-token-new-user',
        user: {
          id: Date.now(),
          name: userData.name,
          email: userData.email,
          role: 'user'
        }
      }
    }
  },
  
  // Mock SSO
  ssoLogin: async (provider) => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    return {
      data: {
        token: `mock-jwt-token-${provider}`,
        user: {
          id: Date.now(),
          name: `${provider} User`,
          email: `user@${provider}.com`,
          role: 'user'
        }
      }
    }
  }
}

export default apiClient