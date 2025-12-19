const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arvis-collection');

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@arviscollection.com',
    password: 'admin123',
    role: 'admin',
    isEmailVerified: true
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'user',
    isEmailVerified: true
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'user',
    isEmailVerified: true
  }
];

const categories = [
  {
    name: "Men's Fashion",
    description: "Stylish clothing and accessories for men",
    status: 'active',
    featured: true,
    sortOrder: 1
  },
  {
    name: "Women's Fashion",
    description: "Elegant clothing and accessories for women",
    status: 'active',
    featured: true,
    sortOrder: 2
  },
  {
    name: "Accessories",
    description: "Fashion accessories for all occasions",
    status: 'active',
    featured: true,
    sortOrder: 3
  }
];

const products = [
  {
    name: "Classic White Shirt",
    description: "Premium cotton white shirt perfect for formal and casual occasions. Made with high-quality fabric for comfort and durability.",
    shortDescription: "Premium cotton white shirt for men",
    price: 49.99,
    comparePrice: 69.99,
    quantity: 50,
    brand: "Arvi's Collection",
    tags: ["shirt", "formal", "cotton", "white"],
    images: [
      {
        public_id: "shirt_1",
        url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop",
        alt: "Classic White Shirt",
        isMain: true
      }
    ],
    specifications: [
      { name: "Material", value: "100% Cotton" },
      { name: "Fit", value: "Regular" },
      { name: "Care", value: "Machine wash cold" }
    ],
    status: 'active',
    featured: true,
    onSale: true
  },
  {
    name: "Elegant Black Dress",
    description: "Sophisticated black dress perfect for special occasions and evening events. Features elegant design and comfortable fit.",
    shortDescription: "Sophisticated black dress for women",
    price: 89.99,
    comparePrice: 119.99,
    quantity: 30,
    brand: "Arvi's Collection",
    tags: ["dress", "formal", "black", "elegant"],
    images: [
      {
        public_id: "dress_1",
        url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop",
        alt: "Elegant Black Dress",
        isMain: true
      }
    ],
    specifications: [
      { name: "Material", value: "Polyester blend" },
      { name: "Length", value: "Knee-length" },
      { name: "Care", value: "Dry clean only" }
    ],
    status: 'active',
    featured: true,
    onSale: true
  },
  {
    name: "Leather Handbag",
    description: "Premium leather handbag with multiple compartments. Perfect for daily use with elegant design and practical functionality.",
    shortDescription: "Premium leather handbag with multiple compartments",
    price: 129.99,
    quantity: 25,
    brand: "Arvi's Collection",
    tags: ["handbag", "leather", "accessories", "premium"],
    images: [
      {
        public_id: "handbag_1",
        url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
        alt: "Leather Handbag",
        isMain: true
      }
    ],
    specifications: [
      { name: "Material", value: "Genuine Leather" },
      { name: "Dimensions", value: "12\" x 8\" x 4\"" },
      { name: "Compartments", value: "3 main, 2 side pockets" }
    ],
    status: 'active',
    featured: true
  },
  {
    name: "Casual Jeans",
    description: "Comfortable casual jeans for everyday wear. Made with premium denim for durability and style.",
    shortDescription: "Comfortable casual jeans for everyday wear",
    price: 69.99,
    quantity: 40,
    brand: "Arvi's Collection",
    tags: ["jeans", "casual", "denim", "comfortable"],
    images: [
      {
        public_id: "jeans_1",
        url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
        alt: "Casual Jeans",
        isMain: true
      }
    ],
    specifications: [
      { name: "Material", value: "98% Cotton, 2% Elastane" },
      { name: "Fit", value: "Slim fit" },
      { name: "Care", value: "Machine wash cold" }
    ],
    status: 'active'
  },
  {
    name: "Summer Blouse",
    description: "Light and airy summer blouse perfect for warm weather. Features breathable fabric and stylish design.",
    shortDescription: "Light and airy summer blouse",
    price: 39.99,
    quantity: 35,
    brand: "Arvi's Collection",
    tags: ["blouse", "summer", "light", "breathable"],
    images: [
      {
        public_id: "blouse_1",
        url: "https://images.unsplash.com/photo-1564257577-0a8c8e0b6e3e?w=400&h=400&fit=crop",
        alt: "Summer Blouse",
        isMain: true
      }
    ],
    specifications: [
      { name: "Material", value: "Cotton blend" },
      { name: "Sleeve", value: "Short sleeve" },
      { name: "Care", value: "Machine wash cold" }
    ],
    status: 'active'
  },
  {
    name: "Designer Watch",
    description: "Elegant designer watch with leather strap. Perfect combination of style and functionality.",
    shortDescription: "Elegant designer watch with leather strap",
    price: 199.99,
    quantity: 15,
    brand: "Arvi's Collection",
    tags: ["watch", "designer", "leather", "elegant"],
    images: [
      {
        public_id: "watch_1",
        url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop",
        alt: "Designer Watch",
        isMain: true
      }
    ],
    specifications: [
      { name: "Movement", value: "Quartz" },
      { name: "Strap", value: "Genuine leather" },
      { name: "Water Resistance", value: "30m" }
    ],
    status: 'active',
    featured: true
  }
];

// Seed function
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();

    console.log('🗑️  Cleared existing data');

    // Create users
    const createdUsers = await User.create(users);
    console.log('👥 Created users');

    // Create categories
    const createdCategories = await Category.create(
      categories.map(cat => ({
        ...cat,
        createdBy: createdUsers[0]._id // Admin user
      }))
    );
    console.log('📂 Created categories');

    // Assign categories to products
    const productsWithCategories = products.map((product, index) => ({
      ...product,
      category: createdCategories[index % 3]._id, // Distribute across categories
      createdBy: createdUsers[0]._id // Admin user
    }));

    // Create products
    await Product.create(productsWithCategories);
    console.log('🛍️  Created products');

    console.log('✅ Database seeded successfully!');
    console.log('\n📧 Admin credentials:');
    console.log('Email: admin@arviscollection.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed function
seedData();