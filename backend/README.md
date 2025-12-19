# Arvi's Collection Backend API

A secure, scalable Node.js backend API for the Arvi's Collection e-commerce platform.

## 🚀 Features

### 🔐 Security Features
- **JWT Authentication** with refresh tokens
- **Role-based Access Control** (Admin/User)
- **Rate Limiting** to prevent abuse
- **Input Validation** and sanitization
- **XSS Protection** with helmet
- **NoSQL Injection Protection**
- **Password Hashing** with bcrypt
- **Account Lockout** after failed attempts
- **Email Verification** system

### 📊 API Features
- **RESTful API** design
- **MongoDB** with Mongoose ODM
- **File Upload** support (Cloudinary)
- **Email System** with templates
- **Search & Filtering** capabilities
- **Pagination** support
- **Error Handling** middleware
- **Logging** with Morgan
- **Data Compression**

### 🛒 E-commerce Features
- **Product Management** (CRUD)
- **Category Management** with hierarchy
- **Order Processing** system
- **Inventory Tracking**
- **User Management**
- **Shopping Cart** persistence
- **Payment Integration** ready

## 📦 Installation

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Environment Setup:**
```bash
cp .env.example .env
```

4. **Configure environment variables in `.env`:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/arvis-collection
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
ADMIN_EMAIL=admin@arviscollection.com
ADMIN_PASSWORD=admin123
```

5. **Start MongoDB** (if running locally)

6. **Seed the database:**
```bash
npm run seed
```

7. **Start the server:**
```bash
# Development
npm run dev

# Production
npm start
```

## 🗄️ Database Models

### User Model
- Authentication & authorization
- Profile management
- Social login support
- Account security features

### Product Model
- Complete product information
- Image management
- Inventory tracking
- SEO optimization
- Variants support

### Category Model
- Hierarchical structure
- SEO-friendly URLs
- Featured categories

### Order Model
- Complete order lifecycle
- Payment tracking
- Shipping information
- Order statistics

## 🛣️ API Routes

### Authentication Routes (`/api/auth`)
```
POST   /register          - Register new user
POST   /login             - User login
POST   /logout            - User logout
GET    /me                - Get current user
PUT    /profile           - Update profile
PUT    /password          - Change password
POST   /forgot-password   - Request password reset
PUT    /reset-password/:token - Reset password
GET    /verify-email/:token - Verify email
POST   /refresh-token     - Refresh JWT token
POST   /sso/:provider     - SSO login
```

### Product Routes (`/api/products`)
```
GET    /                  - Get all products (with filters)
GET    /search            - Search products
GET    /featured          - Get featured products
GET    /:id               - Get single product
GET    /:id/related       - Get related products
POST   /                  - Create product (Admin)
PUT    /:id               - Update product (Admin)
DELETE /:id               - Delete product (Admin)
```

### Category Routes (`/api/categories`)
```
GET    /                  - Get all categories
GET    /tree              - Get category tree
GET    /:id               - Get single category
POST   /                  - Create category (Admin)
PUT    /:id               - Update category (Admin)
DELETE /:id               - Delete category (Admin)
```

### Order Routes (`/api/orders`)
```
GET    /                  - Get all orders (Admin)
GET    /my-orders         - Get user orders
GET    /:id               - Get single order
POST   /                  - Create new order
PUT    /:id/status        - Update order status (Admin)
GET    /stats/overview    - Get order statistics (Admin)
```

### User Routes (`/api/users`)
```
GET    /                  - Get all users (Admin)
GET    /:id               - Get single user (Admin)
PUT    /:id               - Update user (Admin)
DELETE /:id               - Delete user (Admin)
```

## 🔒 Security Measures

### Authentication & Authorization
- JWT tokens with expiration
- Refresh token mechanism
- Role-based access control
- Account lockout after failed attempts

### Data Protection
- Input validation with express-validator
- XSS protection with xss-clean
- NoSQL injection prevention
- Parameter pollution protection
- CORS configuration

### Rate Limiting
- General API: 100 requests/15 minutes
- Auth endpoints: 5 requests/15 minutes

### Password Security
- Bcrypt hashing with salt rounds
- Password complexity requirements
- Secure password reset flow

## 📧 Email System

The API includes a complete email system with:
- Welcome emails
- Email verification
- Password reset emails
- Order confirmations
- HTML email templates

Configure SMTP settings in `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📊 Monitoring & Logging

- Request logging with Morgan
- Error tracking and handling
- Performance monitoring ready
- Health check endpoint: `GET /api/health`

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/arvis-collection
JWT_SECRET=your-production-jwt-secret
CLIENT_URL=https://your-frontend-domain.com
```

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Deployment Platforms
- **Heroku**: Ready with Procfile
- **Railway**: One-click deployment
- **DigitalOcean**: App Platform ready
- **AWS**: EC2 or Elastic Beanstalk
- **Vercel**: Serverless functions

## 📈 Performance Optimization

- Database indexing for fast queries
- Response compression with gzip
- Efficient pagination
- Image optimization with Cloudinary
- Caching strategies ready

## 🔧 Development Tools

- **Nodemon**: Auto-restart during development
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **Supertest**: API testing

## 📝 API Documentation

Full API documentation is available at:
- Development: `http://localhost:5000/api/docs`
- Swagger/OpenAPI specification included

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: support@arviscollection.com
- Create an issue in the repository
- Check the documentation

---

**Built with ❤️ for Arvi's Collection**