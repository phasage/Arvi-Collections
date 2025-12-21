const fs = require('fs');
const path = require('path');

class FileDatabase {
  constructor(dbPath = './database/data') {
    this.dbPath = dbPath;
    this.ensureDirectoryExists();
    this.initializeDatabase();
  }

  ensureDirectoryExists() {
    if (!fs.existsSync(this.dbPath)) {
      fs.mkdirSync(this.dbPath, { recursive: true });
    }
  }

  getFilePath(collection) {
    return path.join(this.dbPath, `${collection}.json`);
  }

  readCollection(collection) {
    const filePath = this.getFilePath(collection);
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error(`Error reading collection ${collection}:`, error);
      return [];
    }
  }

  writeCollection(collection, data) {
    const filePath = this.getFilePath(collection);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing collection ${collection}:`, error);
      return false;
    }
  }

  // Generate unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // CREATE operations
  insert(collection, document) {
    const data = this.readCollection(collection);
    const newDocument = {
      _id: this.generateId(),
      ...document,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.push(newDocument);
    this.writeCollection(collection, data);
    return newDocument;
  }

  insertMany(collection, documents) {
    const data = this.readCollection(collection);
    const newDocuments = documents.map(doc => ({
      _id: this.generateId(),
      ...doc,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    data.push(...newDocuments);
    this.writeCollection(collection, data);
    return newDocuments;
  }

  // READ operations
  find(collection, query = {}) {
    const data = this.readCollection(collection);
    if (Object.keys(query).length === 0) {
      return data;
    }
    
    return data.filter(item => {
      return Object.keys(query).every(key => {
        if (key === '_id') {
          return item._id === query[key];
        }
        if (typeof query[key] === 'object' && query[key].$regex) {
          const regex = new RegExp(query[key].$regex, query[key].$options || 'i');
          return regex.test(item[key]);
        }
        if (typeof query[key] === 'object' && query[key].$in) {
          return query[key].$in.includes(item[key]);
        }
        return item[key] === query[key];
      });
    });
  }

  findOne(collection, query = {}) {
    const results = this.find(collection, query);
    return results.length > 0 ? results[0] : null;
  }

  findById(collection, id) {
    return this.findOne(collection, { _id: id });
  }

  // UPDATE operations
  updateOne(collection, query, update) {
    const data = this.readCollection(collection);
    const index = data.findIndex(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
    
    if (index !== -1) {
      data[index] = {
        ...data[index],
        ...update,
        updatedAt: new Date().toISOString()
      };
      this.writeCollection(collection, data);
      return data[index];
    }
    return null;
  }

  updateById(collection, id, update) {
    return this.updateOne(collection, { _id: id }, update);
  }

  updateMany(collection, query, update) {
    const data = this.readCollection(collection);
    let updatedCount = 0;
    
    data.forEach((item, index) => {
      const matches = Object.keys(query).every(key => item[key] === query[key]);
      if (matches) {
        data[index] = {
          ...data[index],
          ...update,
          updatedAt: new Date().toISOString()
        };
        updatedCount++;
      }
    });
    
    if (updatedCount > 0) {
      this.writeCollection(collection, data);
    }
    return updatedCount;
  }

  // DELETE operations
  deleteOne(collection, query) {
    const data = this.readCollection(collection);
    const index = data.findIndex(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
    
    if (index !== -1) {
      const deleted = data.splice(index, 1)[0];
      this.writeCollection(collection, data);
      return deleted;
    }
    return null;
  }

  deleteById(collection, id) {
    return this.deleteOne(collection, { _id: id });
  }

  deleteMany(collection, query) {
    const data = this.readCollection(collection);
    const originalLength = data.length;
    
    const filtered = data.filter(item => {
      return !Object.keys(query).every(key => item[key] === query[key]);
    });
    
    if (filtered.length !== originalLength) {
      this.writeCollection(collection, filtered);
      return originalLength - filtered.length;
    }
    return 0;
  }

  // COUNT operations
  count(collection, query = {}) {
    return this.find(collection, query).length;
  }

  // AGGREGATION operations
  aggregate(collection, pipeline) {
    let data = this.readCollection(collection);
    
    pipeline.forEach(stage => {
      if (stage.$match) {
        data = data.filter(item => {
          return Object.keys(stage.$match).every(key => item[key] === stage.$match[key]);
        });
      }
      
      if (stage.$sort) {
        const sortKey = Object.keys(stage.$sort)[0];
        const sortOrder = stage.$sort[sortKey];
        data.sort((a, b) => {
          if (sortOrder === 1) {
            return a[sortKey] > b[sortKey] ? 1 : -1;
          } else {
            return a[sortKey] < b[sortKey] ? 1 : -1;
          }
        });
      }
      
      if (stage.$limit) {
        data = data.slice(0, stage.$limit);
      }
      
      if (stage.$skip) {
        data = data.slice(stage.$skip);
      }
    });
    
    return data;
  }

  // Initialize database with sample data
  initializeDatabase() {
    // Check if data already exists
    if (this.count('users') > 0) {
      return; // Database already initialized
    }

    console.log('🔧 Initializing file database with sample data...');

    // Create users
    const users = [
      {
        name: 'Admin User',
        email: 'admin@arviscollection.com',
        password: '$2a$12$50DJKb680rRiPoY9E4UxWeT.GVXYuimQZOPVAvMRZFxH/1TX2N0bW', // admin123 (enhanced security)
        role: 'admin',
        phone: '+1234567890',
        address: {
          street: '123 Admin Street',
          city: 'Admin City',
          state: 'AC',
          zipCode: '12345',
          country: 'USA'
        },
        isEmailVerified: true,
        registrationIP: '127.0.0.1',
        lastLogin: new Date(),
        loginAttempts: 0,
        accountLocked: false,
        mfaEnabled: false,
        mfaSettings: {}
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: '$2a$12$sTYyDmc7020IPmWC9WW4DeKhq4yv4FeF0VQGFcD8qPTsx8A..rLKi', // password123 (enhanced security)
        role: 'customer',
        phone: '+1234567891',
        isEmailVerified: true,
        registrationIP: '127.0.0.1',
        lastLogin: new Date(),
        loginAttempts: 0,
        accountLocked: false,
        mfaEnabled: false,
        mfaSettings: {}
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: '$2a$12$sTYyDmc7020IPmWC9WW4DeKhq4yv4FeF0VQGFcD8qPTsx8A..rLKi', // password123 (enhanced security)
        role: 'customer',
        phone: '+1234567892',
        isEmailVerified: true,
        registrationIP: '127.0.0.1',
        lastLogin: new Date(),
        loginAttempts: 0,
        accountLocked: false,
        mfaEnabled: false,
        mfaSettings: {}
      }
    ];

    // Create categories
    const categories = [
      {
        name: 'Clothing',
        description: 'Fashionable clothing for all occasions',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
        active: true
      },
      {
        name: 'Accessories',
        description: 'Stylish accessories to complete your look',
        image: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=400',
        active: true
      },
      {
        name: 'Footwear',
        description: 'Comfortable and trendy shoes',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
        active: true
      }
    ];

    // Insert categories first to get their IDs
    const insertedCategories = this.insertMany('categories', categories);

    // Create products
    const products = [
      {
        name: 'Premium Cotton T-Shirt',
        description: 'High-quality cotton t-shirt perfect for everyday wear. Soft, comfortable, and durable.',
        price: 29.99,
        comparePrice: 39.99,
        category: insertedCategories[0]._id,
        brand: "Arvi's Collection",
        sku: 'AC-TSHIRT-001',
        stock: 50,
        images: [
          { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', alt: 'Premium Cotton T-Shirt' }
        ],
        features: ['100% Cotton', 'Machine Washable', 'Comfortable Fit'],
        specifications: {
          'Material': '100% Cotton',
          'Care': 'Machine Wash Cold',
          'Fit': 'Regular'
        },
        tags: ['cotton', 'casual', 'comfortable'],
        featured: true,
        onSale: true,
        active: true
      },
      {
        name: 'Designer Denim Jeans',
        description: 'Stylish denim jeans with a modern fit. Perfect for casual and semi-formal occasions.',
        price: 79.99,
        comparePrice: 99.99,
        category: insertedCategories[0]._id,
        brand: "Arvi's Collection",
        sku: 'AC-JEANS-001',
        stock: 30,
        images: [
          { url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', alt: 'Designer Denim Jeans' }
        ],
        features: ['Stretch Denim', 'Modern Fit', 'Durable Construction'],
        specifications: {
          'Material': '98% Cotton, 2% Elastane',
          'Care': 'Machine Wash Cold',
          'Fit': 'Slim'
        },
        tags: ['denim', 'jeans', 'casual'],
        featured: true,
        onSale: true,
        active: true
      },
      {
        name: 'Sport Running Shoes',
        description: 'Lightweight running shoes designed for comfort and performance. Perfect for daily runs and workouts.',
        price: 99.99,
        category: insertedCategories[2]._id,
        brand: "Arvi's Collection",
        sku: 'AC-SHOES-001',
        stock: 25,
        images: [
          { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', alt: 'Sport Running Shoes' }
        ],
        features: ['Lightweight', 'Breathable Mesh', 'Cushioned Sole'],
        specifications: {
          'Material': 'Synthetic Mesh',
          'Sole': 'Rubber',
          'Type': 'Running'
        },
        tags: ['shoes', 'running', 'sport'],
        featured: true,
        active: true
      },
      {
        name: 'Leather Handbag',
        description: 'Elegant leather handbag perfect for work and special occasions. Spacious and stylish.',
        price: 149.99,
        category: insertedCategories[1]._id,
        brand: "Arvi's Collection",
        sku: 'AC-BAG-001',
        stock: 15,
        images: [
          { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', alt: 'Leather Handbag' }
        ],
        features: ['Genuine Leather', 'Multiple Compartments', 'Adjustable Strap'],
        specifications: {
          'Material': 'Genuine Leather',
          'Dimensions': '12" x 8" x 4"',
          'Closure': 'Zipper'
        },
        tags: ['leather', 'handbag', 'accessories'],
        featured: true,
        active: true
      },
      {
        name: 'Casual Button Shirt',
        description: 'Versatile button-up shirt suitable for both casual and business casual settings.',
        price: 49.99,
        category: insertedCategories[0]._id,
        brand: "Arvi's Collection",
        sku: 'AC-SHIRT-001',
        stock: 40,
        images: [
          { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', alt: 'Casual Button Shirt' }
        ],
        features: ['Wrinkle Resistant', 'Breathable Fabric', 'Classic Fit'],
        specifications: {
          'Material': '60% Cotton, 40% Polyester',
          'Care': 'Machine Wash',
          'Fit': 'Classic'
        },
        tags: ['shirt', 'casual', 'business'],
        active: true
      },
      {
        name: 'Winter Jacket',
        description: 'Warm and stylish winter jacket to keep you comfortable in cold weather.',
        price: 129.99,
        category: insertedCategories[0]._id,
        brand: "Arvi's Collection",
        sku: 'AC-JACKET-001',
        stock: 20,
        images: [
          { url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400', alt: 'Winter Jacket' }
        ],
        features: ['Water Resistant', 'Insulated', 'Multiple Pockets'],
        specifications: {
          'Material': 'Polyester Shell, Down Fill',
          'Care': 'Dry Clean Only',
          'Season': 'Winter'
        },
        tags: ['jacket', 'winter', 'outerwear'],
        active: true
      }
    ];

    // Insert data
    this.insertMany('users', users);
    this.insertMany('products', products);

    console.log('✅ File database initialized successfully');
    console.log(`📊 Sample data: ${users.length} users, ${insertedCategories.length} categories, ${products.length} products`);
  }

  // Utility methods
  drop(collection) {
    const filePath = this.getFilePath(collection);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }

  dropDatabase() {
    const collections = ['users', 'categories', 'products', 'orders'];
    collections.forEach(collection => {
      this.drop(collection);
    });
    console.log('🗑️ Database dropped');
  }

  getCollections() {
    const files = fs.readdirSync(this.dbPath);
    return files.filter(file => file.endsWith('.json')).map(file => file.replace('.json', ''));
  }

  getStats() {
    const collections = this.getCollections();
    const stats = {};
    collections.forEach(collection => {
      stats[collection] = this.count(collection);
    });
    return stats;
  }
}

module.exports = FileDatabase;