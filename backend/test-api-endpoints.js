#!/usr/bin/env node

/**
 * API Endpoint Testing Script
 * Tests all major API endpoints to ensure they're working correctly
 */

const http = require('http');

const BASE_URL = 'localhost';
const PORT = 5000;
const API_BASE = '/api';

// Test configuration
const tests = [
  {
    name: 'Health Check',
    method: 'GET',
    path: '/health',
    expectedStatus: 200
  },
  {
    name: 'Get All Products',
    method: 'GET',
    path: '/products',
    expectedStatus: 200
  },
  {
    name: 'Get Featured Products',
    method: 'GET',
    path: '/products/featured',
    expectedStatus: 200
  },
  {
    name: 'Get All Categories',
    method: 'GET',
    path: '/categories',
    expectedStatus: 200
  },
  {
    name: 'Search Products',
    method: 'GET',
    path: '/products/search?q=shirt',
    expectedStatus: 200
  },
  {
    name: 'Admin Login',
    method: 'POST',
    path: '/auth/login',
    body: {
      email: 'admin@arviscollection.com',
      password: 'admin123'
    },
    expectedStatus: 200
  },
  {
    name: 'User Registration',
    method: 'POST',
    path: '/auth/register',
    body: {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123'
    },
    expectedStatus: 201
  }
];

// Helper function to make HTTP requests
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    
    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('🚀 Starting API Endpoint Tests...\n');
  console.log(`Testing API at: http://${BASE_URL}:${PORT}${API_BASE}\n`);
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const options = {
        hostname: BASE_URL,
        port: PORT,
        path: `${API_BASE}${test.path}`,
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'API-Test-Script/1.0'
        }
      };
      
      console.log(`Testing: ${test.name}`);
      console.log(`  ${test.method} ${options.path}`);
      
      const response = await makeRequest(options, test.body);
      
      if (response.statusCode === test.expectedStatus) {
        console.log(`  ✅ PASS - Status: ${response.statusCode}`);
        
        // Log additional info for successful responses
        if (response.data && typeof response.data === 'object') {
          if (response.data.success) {
            console.log(`  📊 Success: ${response.data.success}`);
          }
          if (response.data.count !== undefined) {
            console.log(`  📈 Count: ${response.data.count}`);
          }
          if (response.data.message) {
            console.log(`  💬 Message: ${response.data.message}`);
          }
          if (response.data.token) {
            console.log(`  🔑 Token received: ${response.data.token.substring(0, 20)}...`);
          }
        }
        passed++;
      } else {
        console.log(`  ❌ FAIL - Expected: ${test.expectedStatus}, Got: ${response.statusCode}`);
        if (response.data && response.data.error) {
          console.log(`  🚨 Error: ${response.data.error}`);
        }
        failed++;
      }
      
    } catch (error) {
      console.log(`  ❌ FAIL - Network Error: ${error.message}`);
      failed++;
    }
    
    console.log(''); // Empty line for readability
  }
  
  // Summary
  console.log('📋 Test Summary:');
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  📊 Total: ${tests.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! API is working correctly.');
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed. Please check the API server.`);
  }
  
  // Additional info
  console.log('\n📚 API Documentation:');
  console.log(`  🌐 Swagger UI: http://${BASE_URL}:${PORT}${API_BASE}/docs`);
  console.log(`  📖 Health Check: http://${BASE_URL}:${PORT}${API_BASE}/health`);
  console.log(`  🛍️  Products: http://${BASE_URL}:${PORT}${API_BASE}/products`);
}

// Run the tests
runTests().catch(console.error);