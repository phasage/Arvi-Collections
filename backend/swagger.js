const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Arvi\'s Collection API',
      version: '1.0.0',
      description: 'Comprehensive e-commerce API for Arvi\'s Collection - Premium Fashion Store',
      contact: {
        name: 'API Support',
        email: 'support@arviscollection.com',
        url: 'https://arviscollection.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.arviscollection.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'JWT token stored in HTTP-only cookie'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            _id: {
              type: 'string',
              description: 'User unique identifier',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'User full name',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john@example.com'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              default: 'user',
              description: 'User role in the system'
            },
            avatar: {
              type: 'object',
              properties: {
                public_id: { type: 'string' },
                url: { 
                  type: 'string',
                  format: 'uri',
                  example: 'https://res.cloudinary.com/demo/image/upload/avatar.jpg'
                }
              }
            },
            phone: {
              type: 'string',
              description: 'User phone number',
              example: '+1-555-123-4567'
            },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string', example: '123 Main St' },
                city: { type: 'string', example: 'New York' },
                state: { type: 'string', example: 'NY' },
                zipCode: { type: 'string', example: '10001' },
                country: { type: 'string', example: 'United States' }
              }
            },
            isEmailVerified: {
              type: 'boolean',
              default: false,
              description: 'Email verification status'
            },
            preferences: {
              type: 'object',
              properties: {
                newsletter: { type: 'boolean', default: true },
                notifications: { type: 'boolean', default: true }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Product: {
          type: 'object',
          required: ['name', 'description', 'price', 'category'],
          properties: {
            _id: {
              type: 'string',
              description: 'Product unique identifier',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              maxLength: 100,
              description: 'Product name',
              example: 'Classic White Shirt'
            },
            slug: {
              type: 'string',
              description: 'URL-friendly product identifier',
              example: 'classic-white-shirt'
            },
            description: {
              type: 'string',
              maxLength: 2000,
              description: 'Detailed product description',
              example: 'Premium cotton white shirt perfect for formal and casual occasions'
            },
            shortDescription: {
              type: 'string',
              maxLength: 500,
              description: 'Brief product description',
              example: 'Premium cotton white shirt for men'
            },
            price: {
              type: 'number',
              minimum: 0,
              description: 'Product price in USD',
              example: 49.99
            },
            comparePrice: {
              type: 'number',
              minimum: 0,
              description: 'Original price for discount calculation',
              example: 69.99
            },
            quantity: {
              type: 'integer',
              minimum: 0,
              description: 'Available stock quantity',
              example: 50
            },
            category: {
              type: 'string',
              description: 'Product category ID',
              example: '507f1f77bcf86cd799439011'
            },
            brand: {
              type: 'string',
              description: 'Product brand',
              example: 'Arvi\'s Collection'
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Product tags for search and filtering',
              example: ['shirt', 'formal', 'cotton', 'white']
            },
            images: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  public_id: { type: 'string' },
                  url: { 
                    type: 'string',
                    format: 'uri',
                    example: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c'
                  },
                  alt: { type: 'string', example: 'Classic White Shirt' },
                  isMain: { type: 'boolean', default: false }
                }
              }
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'draft', 'archived'],
              default: 'active',
              description: 'Product status'
            },
            featured: {
              type: 'boolean',
              default: false,
              description: 'Featured product flag'
            },
            onSale: {
              type: 'boolean',
              default: false,
              description: 'Sale status'
            },
            ratings: {
              type: 'object',
              properties: {
                average: { 
                  type: 'number',
                  minimum: 0,
                  maximum: 5,
                  example: 4.5
                },
                count: { 
                  type: 'integer',
                  minimum: 0,
                  example: 24
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Category: {
          type: 'object',
          required: ['name'],
          properties: {
            _id: {
              type: 'string',
              description: 'Category unique identifier',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              maxLength: 50,
              description: 'Category name',
              example: 'Men\'s Fashion'
            },
            slug: {
              type: 'string',
              description: 'URL-friendly category identifier',
              example: 'mens-fashion'
            },
            description: {
              type: 'string',
              maxLength: 500,
              description: 'Category description',
              example: 'Stylish clothing and accessories for men'
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
              default: 'active',
              description: 'Category status'
            },
            featured: {
              type: 'boolean',
              default: false,
              description: 'Featured category flag'
            },
            sortOrder: {
              type: 'integer',
              description: 'Display order',
              example: 1
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Order: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Order unique identifier',
              example: '507f1f77bcf86cd799439011'
            },
            orderNumber: {
              type: 'string',
              description: 'Human-readable order number',
              example: 'ORD-2024-001'
            },
            user: {
              type: 'string',
              description: 'User ID who placed the order',
              example: '507f1f77bcf86cd799439011'
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: { type: 'string', example: '507f1f77bcf86cd799439011' },
                  name: { type: 'string', example: 'Classic White Shirt' },
                  price: { type: 'number', example: 49.99 },
                  quantity: { type: 'integer', example: 2 },
                  total: { type: 'number', example: 99.98 }
                }
              }
            },
            subtotal: {
              type: 'number',
              description: 'Order subtotal',
              example: 99.98
            },
            tax: {
              type: 'number',
              description: 'Tax amount',
              example: 8.50
            },
            shipping: {
              type: 'number',
              description: 'Shipping cost',
              example: 9.99
            },
            total: {
              type: 'number',
              description: 'Order total',
              example: 118.47
            },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
              default: 'pending',
              description: 'Order status'
            },
            shippingAddress: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'John Doe' },
                street: { type: 'string', example: '123 Main St' },
                city: { type: 'string', example: 'New York' },
                state: { type: 'string', example: 'NY' },
                zipCode: { type: 'string', example: '10001' },
                country: { type: 'string', example: 'United States' }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              description: 'Error message',
              example: 'Resource not found'
            },
            statusCode: {
              type: 'integer',
              description: 'HTTP status code',
              example: 404
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Success message',
              example: 'Operation completed successfully'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Products',
        description: 'Product management and catalog endpoints'
      },
      {
        name: 'Categories',
        description: 'Product category management endpoints'
      },
      {
        name: 'Orders',
        description: 'Order management and processing endpoints'
      },
      {
        name: 'Users',
        description: 'User management endpoints (Admin only)'
      },
      {
        name: 'Health',
        description: 'System health and status endpoints'
      }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './swagger-docs/*.js'
  ]
};

const specs = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  specs
};