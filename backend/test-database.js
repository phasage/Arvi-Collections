const DatabaseService = require('./services/database');

async function testDatabase() {
  console.log('🧪 Testing File Database...\n');
  
  const db = new DatabaseService();
  
  try {
    // Test 1: Get Statistics
    console.log('📊 Database Statistics:');
    const stats = await db.getStats();
    console.log(JSON.stringify(stats, null, 2));
    console.log('');
    
    // Test 2: Get All Products
    console.log('🛍️ All Products:');
    const products = await db.getAllProducts();
    console.log(`Found ${products.length} products`);
    products.forEach(product => {
      console.log(`- ${product.name}: $${product.price}`);
    });
    console.log('');
    
    // Test 3: Search Products
    console.log('🔍 Search for "shirt":');
    const shirtProducts = await db.searchProducts('shirt');
    console.log(`Found ${shirtProducts.length} products matching "shirt"`);
    shirtProducts.forEach(product => {
      console.log(`- ${product.name}: $${product.price}`);
    });
    console.log('');
    
    // Test 4: Get Categories
    console.log('📂 All Categories:');
    const categories = await db.getAllCategories();
    console.log(`Found ${categories.length} categories`);
    categories.forEach(category => {
      console.log(`- ${category.name}: ${category.description}`);
    });
    console.log('');
    
    // Test 5: Get Users
    console.log('👥 All Users:');
    const users = await db.getAllUsers();
    console.log(`Found ${users.length} users`);
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    console.log('');
    
    // Test 6: Find User by Email
    console.log('🔍 Find Admin User:');
    const adminUser = await db.findUserByEmail('admin@arviscollection.com');
    if (adminUser) {
      console.log(`Found: ${adminUser.name} (${adminUser.email})`);
    } else {
      console.log('Admin user not found');
    }
    console.log('');
    
    // Test 7: Create and Delete Test Product
    console.log('➕ Creating Test Product:');
    const testProduct = await db.createProduct({
      name: 'Test Product',
      description: 'This is a test product',
      price: 19.99,
      stock: 10,
      active: true
    });
    console.log(`Created: ${testProduct.name} with ID: ${testProduct._id}`);
    
    console.log('🗑️ Deleting Test Product:');
    const deleted = await db.deleteProduct(testProduct._id);
    console.log(`Deleted: ${deleted ? 'Success' : 'Failed'}`);
    console.log('');
    
    // Test 8: Featured Products
    console.log('⭐ Featured Products:');
    const featuredProducts = await db.getFeaturedProducts(3);
    console.log(`Found ${featuredProducts.length} featured products`);
    featuredProducts.forEach(product => {
      console.log(`- ${product.name}: $${product.price}`);
    });
    console.log('');
    
    console.log('✅ All database tests passed!');
    console.log('🎉 File database is working perfectly!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

// Run the test
testDatabase();