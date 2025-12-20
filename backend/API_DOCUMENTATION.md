# Arvi's Collection API Documentation

## 📚 Interactive API Documentation

**🌟 Access the complete interactive Swagger documentation at:**
**[http://localhost:5000/api/docs](http://localhost:5000/api/docs)**

## 🚀 Quick Start

### Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `https://api.arviscollection.com/api`

### Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in requests using:

**Option 1: Authorization Header**
```
Authorization: Bearer <your-jwt-token>
```

**Option 2: HTTP-Only Cookie**
```
Cookie: token=<your-jwt-token>
```

## 🔐 Demo Credentials

### Admin Account
- **Email**: `admin@arviscollection.com`
- **Password**: `admin123`
- **Role**: `admin`
- **Access**: Full API access including user management

### Regular User Accounts
- **Email**: `john@example.com` / **Password**: `password123`
- **Email**: `jane@example.com` / **Password**: `password123`
- **Role**: `user`
- **Access**: Standard user operations

## 📋 API Endpoints Overview

### 🔑 Authentication (`/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | User login | ❌ |
| POST | `/auth/logout` | User logout | ✅ |
| GET | `/auth/me` | Get current user | ✅ |
| PUT | `/auth/profile` | Update profile | ✅ |
| PUT | `/auth/password` | Change password | ✅ |
| POST | `/auth/forgot-password` | Request password reset | ❌ |
| PUT | `/auth/reset-password/:token` | Reset password | ❌ |
| GET | `/auth/verify-email/:token` | Verify email | ❌ |
| POST | `/auth/refresh-token` | Refresh JWT token | ❌ |
| POST | `/auth/sso/:provider` | Social login | ❌ |

### 🛍️ Products (`/products`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/products` | Get all products (with filters) | ❌ |
| GET | `/products/search` | Search products | ❌ |
| GET | `/products/featured` | Get featured products | ❌ |
| GET | `/products/:id` | Get single product | ❌ |
| GET | `/products/:id/related` | Get related products | ❌ |
| POST | `/products` | Create product | ✅ Admin |
| PUT | `/products/:id` | Update product | ✅ Admin |
| DELETE | `/products/:id` | Delete product | ✅ Admin |

### 🏷️ Categories (`/categories`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/categories` | Get all categories | ❌ |
| GET | `/categories/tree` | Get category tree | ❌ |
| GET | `/categories/:id` | Get single category | ❌ |
| POST | `/categories` | Create category | ✅ Admin |
| PUT | `/categories/:id` | Update category | ✅ Admin |
| DELETE | `/categories/:id` | Delete category | ✅ Admin |

### 📦 Orders (`/orders`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/orders` | Get all orders | ✅ Admin |
| GET | `/orders/my-orders` | Get user's orders | ✅ |
| GET | `/orders/:id` | Get single order | ✅ |
| POST | `/orders` | Create new order | ✅ |
| PUT | `/orders/:id/status` | Update order status | ✅ Admin |
| GET | `/orders/stats/overview` | Get order statistics | ✅ Admin |

### 👥 Users (`/users`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users` | Get all users | ✅ Admin |
| GET | `/users/:id` | Get single user | ✅ Admin |
| PUT | `/users/:id` | Update user | ✅ Admin |
| DELETE | `/users/:id` | Delete user | ✅ Admin |

### 🏥 Health (`/health`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Server health check | ❌ |

## 🔍 Query Parameters

### Products Filtering
```
GET /api/products?page=1&limit=12&category=507f1f77bcf86cd799439011&minPrice=10&maxPrice=100&brand=Arvi's Collection&tags=shirt,formal&status=active&featured=true&onSale=true&inStock=true&search=white shirt&sort=-createdAt
```

### Pagination
Most list endpoints support pagination:
- `page`: Page number (default: 1)
- `limit`: Items per page (default varies by endpoint)

### Sorting
Use the `sort` parameter with field names:
- Ascending: `sort=name`
- Descending: `sort=-name`
- Multiple fields: `sort=name,-createdAt`

## 📝 Request/Response Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@arviscollection.com",
    "password": "admin123"
  }'
```

### Get Products
```bash
curl -X GET "http://localhost:5000/api/products?page=1&limit=5&featured=true"
```

### Create Product (Admin)
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "name": "Premium Leather Jacket",
    "description": "High-quality leather jacket with modern design",
    "price": 299.99,
    "comparePrice": 399.99,
    "quantity": 25,
    "category": "507f1f77bcf86cd799439011",
    "brand": "Arvi'\''s Collection",
    "tags": ["jacket", "leather", "premium"],
    "featured": true
  }'
```

## 🛡️ Security Features

### Rate Limiting
- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP

### Security Headers
- Helmet.js for security headers
- CORS configuration
- XSS protection
- NoSQL injection prevention
- Parameter pollution protection

### Data Validation
- Input sanitization with DOMPurify
- MongoDB sanitization
- Express validator for request validation

## 🚨 Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": "Error message description",
  "statusCode": 400
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## 🧪 Testing the API

### Using cURL
```bash
# Health check
curl http://localhost:5000/api/health

# Get products
curl http://localhost:5000/api/products

# Login and get token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@arviscollection.com","password":"admin123"}' \
  | jq -r '.token')

# Use token for authenticated requests
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/auth/me
```

### Using Postman
1. Import the API collection from Swagger
2. Set up environment variables:
   - `baseUrl`: `http://localhost:5000/api`
   - `token`: Your JWT token
3. Use `{{baseUrl}}` and `{{token}}` in requests

### Using JavaScript/Fetch
```javascript
// Login
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@arviscollection.com',
    password: 'admin123'
  })
});

const { token } = await loginResponse.json();

// Authenticated request
const productsResponse = await fetch('http://localhost:5000/api/products', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const products = await productsResponse.json();
```

## 🔧 Development Mode Features

### Demo Data
When MongoDB is not available, the API runs in demo mode with:
- 3 demo users (1 admin, 2 regular users)
- 3 product categories
- 6 sample products
- In-memory data storage

### Hot Reload
The development server uses nodemon for automatic restart on file changes.

### Logging
Morgan middleware provides detailed request logging in development mode.

## 📊 Database Schema

### User Schema
- Authentication fields (email, password, role)
- Profile information (name, phone, address)
- Security features (account lockout, email verification)
- Social login support
- Preferences and settings

### Product Schema
- Basic info (name, description, price)
- Inventory management (quantity, SKU)
- Media (images, variants)
- SEO optimization
- Categories and tags
- Status and visibility

### Category Schema
- Hierarchical structure support
- SEO-friendly slugs
- Status management
- Featured categories

### Order Schema
- Complete order lifecycle
- Item details and pricing
- Shipping information
- Status tracking
- Payment integration ready

## 🚀 Production Deployment

### Environment Variables
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/arvis-collection
JWT_SECRET=your-production-jwt-secret
CLIENT_URL=https://your-frontend-domain.com
```

### Security Checklist
- [ ] Use HTTPS in production
- [ ] Set secure JWT secret
- [ ] Configure CORS for production domains
- [ ] Set up MongoDB with authentication
- [ ] Configure email service for notifications
- [ ] Set up monitoring and logging
- [ ] Enable rate limiting
- [ ] Regular security updates

## 📞 Support

For API support and questions:
- **Email**: support@arviscollection.com
- **Documentation**: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)
- **GitHub Issues**: Create an issue in the repository

---

**Built with ❤️ for Arvi's Collection**