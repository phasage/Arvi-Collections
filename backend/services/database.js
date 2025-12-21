const FileDatabase = require('../database/fileDatabase');
const security = require('./security');

class DatabaseService {
  constructor() {
    this.db = new FileDatabase();
    this.isConnected = true;
  }

  // Connection methods
  async connect() {
    // File database doesn't need connection
    this.isConnected = true;
    return true;
  }

  async disconnect() {
    this.isConnected = false;
    return true;
  }

  isHealthy() {
    return this.isConnected;
  }

  // Encrypt sensitive user data before storage
  encryptUserData(userData) {
    const encrypted = { ...userData };
    
    // Encrypt sensitive fields
    if (userData.phone) {
      encrypted.phone = security.encryptData(userData.phone);
    }
    
    if (userData.address) {
      encrypted.address = security.encryptData(userData.address);
    }
    
    if (userData.personalInfo) {
      encrypted.personalInfo = security.encryptData(userData.personalInfo);
    }
    
    return encrypted;
  }

  // Decrypt sensitive user data after retrieval
  decryptUserData(userData) {
    if (!userData) return null;
    
    const decrypted = { ...userData };
    
    // Decrypt sensitive fields
    try {
      if (userData.phone && typeof userData.phone === 'string' && userData.phone.length > 20) {
        decrypted.phone = security.decryptData(userData.phone);
      }
      
      if (userData.address && typeof userData.address === 'string' && userData.address.length > 50) {
        decrypted.address = security.decryptData(userData.address);
      }
      
      if (userData.personalInfo && typeof userData.personalInfo === 'string') {
        decrypted.personalInfo = security.decryptData(userData.personalInfo);
      }
    } catch (error) {
      console.error('Error decrypting user data:', error);
      // Return original data if decryption fails (for backward compatibility)
    }
    
    return decrypted;
  }

  // User operations
  async createUser(userData) {
    // Encrypt sensitive data before storage
    const encryptedData = this.encryptUserData(userData);
    const user = this.db.insert('users', encryptedData);
    
    // Return decrypted data (but keep password hash)
    return this.decryptUserData(user);
  }

  async findUserByEmail(email) {
    const user = this.db.findOne('users', { email });
    return this.decryptUserData(user);
  }

  async findUserById(id) {
    const user = this.db.findById('users', id);
    return this.decryptUserData(user);
  }

  async updateUser(id, updateData) {
    // Encrypt sensitive data before update
    const encryptedData = this.encryptUserData(updateData);
    const user = this.db.updateById('users', id, encryptedData);
    
    // Return decrypted data
    return this.decryptUserData(user);
  }

  async deleteUser(id) {
    return this.db.deleteById('users', id);
  }

  async getAllUsers() {
    const users = this.db.find('users');
    // Decrypt all users but remove password hashes for security
    return users.map(user => {
      const decrypted = this.decryptUserData(user);
      if (decrypted) {
        delete decrypted.password; // Never return password hashes
      }
      return decrypted;
    }).filter(Boolean);
  }

  // Category operations
  async createCategory(categoryData) {
    return this.db.insert('categories', categoryData);
  }

  async getAllCategories() {
    return this.db.find('categories', { active: true });
  }

  async getCategoryById(id) {
    return this.db.findById('categories', id);
  }

  async updateCategory(id, updateData) {
    return this.db.updateById('categories', id, updateData);
  }

  async deleteCategory(id) {
    return this.db.deleteById('categories', id);
  }

  // Product operations
  async createProduct(productData) {
    return this.db.insert('products', productData);
  }

  async getAllProducts(filters = {}) {
    let query = { active: true };
    
    if (filters.category) {
      query.category = filters.category;
    }
    
    if (filters.featured) {
      query.featured = true;
    }
    
    let products = this.db.find('products', query);
    
    // Apply search filter
    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      products = products.filter(product => 
        searchRegex.test(product.name) || 
        searchRegex.test(product.description) ||
        (product.tags && product.tags.some(tag => searchRegex.test(tag)))
      );
    }
    
    // Apply sorting
    if (filters.sort) {
      switch (filters.sort) {
        case 'price_asc':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          products.sort((a, b) => b.price - a.price);
          break;
        case 'name_asc':
          products.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name_desc':
          products.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'newest':
          products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        default:
          // Default sort by featured first, then by creation date
          products.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
      }
    }
    
    // Apply pagination
    if (filters.limit) {
      const skip = filters.skip || 0;
      products = products.slice(skip, skip + filters.limit);
    }
    
    return products;
  }

  async getFeaturedProducts(limit = 10) {
    return this.getAllProducts({ featured: true, limit });
  }

  async getProductById(id) {
    return this.db.findById('products', id);
  }

  async updateProduct(id, updateData) {
    return this.db.updateById('products', id, updateData);
  }

  async deleteProduct(id) {
    return this.db.deleteById('products', id);
  }

  async searchProducts(searchTerm) {
    return this.getAllProducts({ search: searchTerm });
  }

  async getProductsByCategory(categoryId) {
    return this.getAllProducts({ category: categoryId });
  }

  // Order operations
  async createOrder(orderData) {
    // Generate order number
    const orderCount = this.db.count('orders');
    const orderNumber = `ORD-${Date.now()}-${String(orderCount + 1).padStart(4, '0')}`;
    
    const order = {
      ...orderData,
      orderNumber,
      status: 'pending'
    };
    
    return this.db.insert('orders', order);
  }

  async getOrderById(id) {
    return this.db.findById('orders', id);
  }

  async getOrderByNumber(orderNumber) {
    return this.db.findOne('orders', { orderNumber });
  }

  async getUserOrders(userId) {
    return this.db.find('orders', { userId }).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  async updateOrder(id, updateData) {
    return this.db.updateById('orders', id, updateData);
  }

  async getAllOrders() {
    return this.db.find('orders').sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  // Analytics and stats
  async getStats() {
    const stats = this.db.getStats();
    
    // Add more detailed stats
    const products = this.db.find('products', { active: true });
    const orders = this.db.find('orders');
    const users = this.db.find('users');
    
    return {
      collections: stats,
      products: {
        total: products.length,
        featured: products.filter(p => p.featured).length,
        onSale: products.filter(p => p.onSale).length,
        outOfStock: products.filter(p => p.stock === 0).length
      },
      orders: {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        completed: orders.filter(o => o.status === 'delivered').length,
        totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0)
      },
      users: {
        total: users.length,
        customers: users.filter(u => u.role === 'customer').length,
        admins: users.filter(u => u.role === 'admin').length
      }
    };
  }

  // Utility methods
  async resetDatabase() {
    this.db.dropDatabase();
    this.db.initializeDatabase();
    return true;
  }

  async backupDatabase() {
    const collections = this.db.getCollections();
    const backup = {};
    
    collections.forEach(collection => {
      backup[collection] = this.db.find(collection);
    });
    
    return backup;
  }

  async restoreDatabase(backup) {
    // Clear existing data
    this.db.dropDatabase();
    
    // Restore from backup
    Object.keys(backup).forEach(collection => {
      backup[collection].forEach(document => {
        // Remove _id to let the database generate new ones
        const { _id, ...docData } = document;
        this.db.insert(collection, docData);
      });
    });
    
    return true;
  }
}

module.exports = DatabaseService;