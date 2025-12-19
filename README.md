# Arvi's Collection - Premium Fashion E-commerce Platform

A modern, secure, and responsive e-commerce platform built with React for selling premium fashion clothing.

## 🚀 Features

### 🔐 Security Features
- **JWT Authentication** with token refresh mechanism
- **Role-based Access Control** (Admin/User roles)
- **Protected Routes** for authenticated users only
- **XSS Protection** with DOMPurify sanitization
- **Content Security Policy** headers
- **Secure Password Handling** with validation
- **Session Management** with persistent storage

### 🛒 E-commerce Features
- **Product Catalog** with categories and search
- **Shopping Cart** with persistent storage
- **User Authentication** (Login/Register)
- **SSO Integration** (Google, Facebook, GitHub)
- **Admin Dashboard** for product management
- **Order Management** system
- **User Profile** management

### 🎨 UI/UX Features
- **Responsive Design** for all devices
- **Modern UI** with Tailwind CSS
- **Smooth Animations** with Framer Motion
- **Toast Notifications** for user feedback
- **Loading States** and error handling
- **Accessible Components** following WCAG guidelines

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for responsive styling
- **Zustand** for state management
- **React Router v6** for navigation
- **React Hook Form** for form handling
- **Framer Motion** for animations
- **Axios** for API communication
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Nodemailer** for email services
- **Cloudinary** for image management
- **Helmet** for security headers
- **Rate limiting** for API protection

## 📦 Installation

### Frontend Setup

1. **Clone the repository:**
```bash
git clone https://github.com/phasage/Arvi-Collections.git
cd Arvi-Collections
```

2. **Install frontend dependencies:**
```bash
npm install
```

3. **Start the frontend development server:**
```bash
npm run dev
```

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install backend dependencies:**
```bash
npm install
```

3. **Setup environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start MongoDB** (locally or use MongoDB Atlas)

5. **Seed the database:**
```bash
npm run seed
```

6. **Start the backend server:**
```bash
npm run dev
```

### Full Stack Development

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 🏗️ Build for Production

```bash
npm run build
```

## 🔑 Demo Credentials

### Admin Account
- **Email**: admin@arviscollection.com
- **Password**: admin123

### Regular User Accounts
- **Email**: john@example.com
- **Password**: password123
- **Email**: jane@example.com  
- **Password**: password123

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx      # Navigation component
│   ├── ProtectedRoute.jsx
│   └── AdminRoute.jsx
├── pages/              # Page components
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Products.jsx
│   └── AdminDashboard.jsx
├── store/              # State management
│   ├── authStore.js    # Authentication state
│   └── cartStore.js    # Shopping cart state
├── services/           # API services
│   └── api.js          # HTTP client and API calls
├── App.jsx             # Main app component
├── main.jsx            # App entry point
└── index.css           # Global styles
```

## 🔒 Security Measures

1. **Authentication**: JWT tokens with automatic refresh
2. **Authorization**: Role-based access control
3. **Input Sanitization**: XSS protection with DOMPurify
4. **HTTPS Only**: Secure communication
5. **Content Security Policy**: Prevents code injection
6. **Password Security**: Minimum length and complexity requirements

## 🌟 Key Features

### For Customers
- Browse products by categories
- Add items to cart with persistent storage
- Secure checkout process
- User profile management
- Order history tracking

### For Administrators
- Product management (CRUD operations)
- Order management
- User management
- Sales analytics
- Inventory tracking

## 🚀 Deployment

The application is ready for deployment on platforms like:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Heroku

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@arviscollection.com or create an issue in this repository.

---

**Built with ❤️ for Arvi's Collection**