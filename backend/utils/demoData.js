// Demo data for when MongoDB is not available
const bcrypt = require('bcryptjs');

const initializeDemoData = async () => {
  if (!global.demoMode) return;

  console.log('🔧 Initializing demo data...');

  // Demo users
  global.demoData.users = [
    {
      _id: '1',
      name: 'Admin User',
      email: 'admin@arviscollection.com',
      password: await bcrypt.hash('admin123', 12),
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '2',
      name: 'John Doe',
      email: 'john@example.com',
      password: await bcrypt.hash('password123', 12),
      role: 'user',
      isEmailVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '3',
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: await bcrypt.hash('password123', 12),
      role: 'user',
      isEmailVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Demo categories
  global.demoData.categories = [
    {
      _id: '1',
      name: "Men's Fashion",
      slug: 'mens-fashion',
      description: 'Stylish clothing and accessories for men',
      status: 'active',
      featured: true,
      sortOrder: 1,
      createdBy: '1',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '2',
      name: "Women's Fashion",
      slug: 'womens-fashion',
      description: 'Elegant clothing and accessories for women',
      status: 'active',
      featured: true,
      sortOrder: 2,
      createdBy: '1',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '3',
      name: 'Accessories',
      slug: 'accessories',
      description: 'Fashion accessories for all occasions',
      status: 'active',
      featured: true,
      sortOrder: 3,
      createdBy: '1',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Demo products
  global.demoData.products = [
    {
      _id: '1',
      name: 'Classic White Shirt',
      slug: 'classic-white-shirt',
      description: 'Premium cotton white shirt perfect for formal and casual occasions. Made with high-quality fabric for comfort and durability.',
      shortDescription: 'Premium cotton white shirt for men',
      price: 49.99,
      comparePrice: 69.99,
      quantity: 50,
      category: '1',
      brand: "Arvi's Collection",
      tags: ['shirt', 'formal', 'cotton', 'white'],
      images: [
        {
          public_id: 'shirt_1',
          url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop',
          alt: 'Classic White Shirt',
          isMain: true
        }
      ],
      status: 'active',
      featured: true,
      onSale: true,
      createdBy: '1',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '2',
      name: 'Elegant Black Dress',
      slug: 'elegant-black-dress',
      description: 'Sophisticated black dress perfect for special occasions and evening events. Features elegant design and comfortable fit.',
      shortDescription: 'Sophisticated black dress for women',
      price: 89.99,
      comparePrice: 119.99,
      quantity: 30,
      category: '2',
      brand: "Arvi's Collection",
      tags: ['dress', 'formal', 'black', 'elegant'],
      images: [
        {
          public_id: 'dress_1',
          url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop',
          alt: 'Elegant Black Dress',
          isMain: true
        }
      ],
      status: 'active',
      featured: true,
      onSale: true,
      createdBy: '1',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '3',
      name: 'Leather Handbag',
      slug: 'leather-handbag',
      description: 'Premium leather handbag with multiple compartments. Perfect for daily use with elegant design and practical functionality.',
      shortDescription: 'Premium leather handbag with multiple compartments',
      price: 129.99,
      quantity: 25,
      category: '3',
      brand: "Arvi's Collection",
      tags: ['handbag', 'leather', 'accessories', 'premium'],
      images: [
        {
          public_id: 'handbag_1',
          url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
          alt: 'Leather Handbag',
          isMain: true
        }
      ],
      status: 'active',
      featured: true,
      createdBy: '1',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '4',
      name: 'Casual Jeans',
      slug: 'casual-jeans',
      description: 'Comfortable casual jeans for everyday wear. Made with premium denim for durability and style.',
      shortDescription: 'Comfortable casual jeans for everyday wear',
      price: 69.99,
      quantity: 40,
      category: '1',
      brand: "Arvi's Collection",
      tags: ['jeans', 'casual', 'denim', 'comfortable'],
      images: [
        {
          public_id: 'jeans_1',
          url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
          alt: 'Casual Jeans',
          isMain: true
        }
      ],
      status: 'active',
      createdBy: '1',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '5',
      name: 'Summer Blouse',
      slug: 'summer-blouse',
      description: 'Light and airy summer blouse perfect for warm weather. Features breathable fabric and stylish design.',
      shortDescription: 'Light and airy summer blouse',
      price: 39.99,
      quantity: 35,
      category: '2',
      brand: "Arvi's Collection",
      tags: ['blouse', 'summer', 'light', 'breathable'],
      images: [
        {
          public_id: 'blouse_1',
          url: 'https://images.unsplash.com/photo-1564257577-0a8c8e0b6e3e?w=400&h=400&fit=crop',
          alt: 'Summer Blouse',
          isMain: true
        }
      ],
      status: 'active',
      createdBy: '1',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '6',
      name: 'Designer Watch',
      slug: 'designer-watch',
      description: 'Elegant designer watch with leather strap. Perfect combination of style and functionality.',
      shortDescription: 'Elegant designer watch with leather strap',
      price: 199.99,
      quantity: 15,
      category: '3',
      brand: "Arvi's Collection",
      tags: ['watch', 'designer', 'leather', 'elegant'],
      images: [
        {
          public_id: 'watch_1',
          url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop',
          alt: 'Designer Watch',
          isMain: true
        }
      ],
      status: 'active',
      featured: true,
      createdBy: '1',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  global.demoData.orders = [];

  console.log('✅ Demo data initialized successfully');
  console.log(`📊 Demo data: ${global.demoData.users.length} users, ${global.demoData.categories.length} categories, ${global.demoData.products.length} products`);
};

module.exports = { initializeDemoData };