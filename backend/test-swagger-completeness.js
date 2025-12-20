/**
 * Test script to verify Swagger documentation completeness
 * This script checks if all API endpoints are properly documented
 */

const fs = require('fs');
const path = require('path');

// Define all expected endpoints based on routes and server.js
const expectedEndpoints = {
  // Auth routes (from auth.js)
  'POST /auth/register': 'User registration',
  'POST /auth/login': 'User login',
  'POST /auth/logout': 'User logout',
  'POST /auth/forgot-password': 'Request password reset',
  'PUT /auth/reset-password/{token}': 'Reset password with token',
  'GET /auth/verify-email/{token}': 'Verify email address',
  'POST /auth/refresh-token': 'Refresh JWT token',
  'POST /auth/sso/{provider}': 'Social Sign-On login',
  'GET /auth/me': 'Get current user profile',
  'PUT /auth/profile': 'Update user profile',
  'PUT /auth/password': 'Update user password',

  // Product routes (from products.js)
  'GET /products': 'Get all products with filtering',
  'GET /products/search': 'Search products',
  'GET /products/featured': 'Get featured products',
  'GET /products/{id}': 'Get single product',
  'GET /products/{id}/related': 'Get related products',
  'POST /products': 'Create product (Admin)',
  'PUT /products/{id}': 'Update product (Admin)',
  'DELETE /products/{id}': 'Delete product (Admin)',

  // Category routes (from categories.js)
  'GET /categories': 'Get all categories',
  'GET /categories/tree': 'Get category tree',
  'GET /categories/{id}': 'Get single category',
  'POST /categories': 'Create category (Admin)',
  'PUT /categories/{id}': 'Update category (Admin)',
  'DELETE /categories/{id}': 'Delete category (Admin)',

  // Order routes (from orders.js)
  'GET /orders': 'Get all orders (Admin)',
  'GET /orders/my-orders': 'Get user orders',
  'GET /orders/{id}': 'Get single order',
  'POST /orders': 'Create order',
  'PUT /orders/{id}/status': 'Update order status (Admin)',
  'GET /orders/stats/overview': 'Get order statistics (Admin)',

  // User routes (from users.js)
  'GET /users': 'Get all users (Admin)',
  'GET /users/{id}': 'Get single user (Admin)',
  'PUT /users/{id}': 'Update user (Admin)',
  'DELETE /users/{id}': 'Delete user (Admin)',

  // Health & Monitoring routes (from server.js)
  'GET /health': 'Get server health status',
  'GET /metrics': 'Get system metrics',
  'GET /performance': 'Get performance report',
  'GET /cache/stats': 'Get cache statistics',
  'GET /images/status': 'Get image service status'
};

// Function to check if swagger documentation exists for each endpoint
function checkSwaggerDocumentation() {
  const swaggerDocsPath = path.join(__dirname, 'swagger-docs');
  const docFiles = fs.readdirSync(swaggerDocsPath);
  
  console.log('🔍 Checking Swagger Documentation Completeness...\n');
  console.log('📁 Found documentation files:', docFiles.join(', '));
  console.log('\n📋 Expected Endpoints:');
  
  let documentedCount = 0;
  let totalCount = Object.keys(expectedEndpoints).length;
  
  // Read all swagger documentation files
  let allSwaggerContent = '';
  docFiles.forEach(file => {
    if (file.endsWith('.js')) {
      const filePath = path.join(swaggerDocsPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      allSwaggerContent += content;
    }
  });
  
  // Check each expected endpoint
  Object.entries(expectedEndpoints).forEach(([endpoint, description]) => {
    const [method, path] = endpoint.split(' ');
    
    // Convert path to swagger format (remove leading slash for search)
    const swaggerPath = path.startsWith('/') ? path.substring(1) : path;
    
    // Check if endpoint is documented
    const isDocumented = allSwaggerContent.includes(swaggerPath);
    
    if (isDocumented) {
      console.log(`✅ ${endpoint} - ${description}`);
      documentedCount++;
    } else {
      console.log(`❌ ${endpoint} - ${description} (MISSING)`);
    }
  });
  
  console.log(`\n📊 Documentation Coverage: ${documentedCount}/${totalCount} (${((documentedCount/totalCount)*100).toFixed(1)}%)`);
  
  if (documentedCount === totalCount) {
    console.log('🎉 All endpoints are properly documented!');
    return true;
  } else {
    console.log(`⚠️  ${totalCount - documentedCount} endpoints are missing documentation.`);
    return false;
  }
}

// Function to check for extra/undocumented endpoints in swagger files
function checkForExtraEndpoints() {
  console.log('\n🔍 Checking for undocumented endpoints in route files...\n');
  
  const routesPath = path.join(__dirname, 'routes');
  const routeFiles = fs.readdirSync(routesPath);
  
  routeFiles.forEach(file => {
    if (file.endsWith('.js')) {
      const filePath = path.join(routesPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract route definitions (basic pattern matching)
      const routeMatches = content.match(/router\.(get|post|put|delete)\(['"`]([^'"`]+)['"`]/g);
      
      if (routeMatches) {
        console.log(`📄 ${file}:`);
        routeMatches.forEach(match => {
          const [, method, path] = match.match(/router\.(\w+)\(['"`]([^'"`]+)['"`]/);
          const fullEndpoint = `${method.toUpperCase()} /${file.replace('.js', '')}${path}`;
          console.log(`   ${fullEndpoint}`);
        });
        console.log('');
      }
    }
  });
}

// Run the checks
console.log('🚀 Starting Swagger Documentation Completeness Check\n');
console.log('=' .repeat(60));

const isComplete = checkSwaggerDocumentation();
checkForExtraEndpoints();

console.log('=' .repeat(60));
console.log(isComplete ? '✅ Documentation check completed successfully!' : '❌ Documentation check found issues!');

module.exports = { checkSwaggerDocumentation, expectedEndpoints };