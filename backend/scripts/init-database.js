const security = require('../services/security');

// Script to generate properly hashed passwords for database initialization
async function generatePasswordHashes() {
  console.log('🔐 Generating secure password hashes...\n');

  const passwords = [
    { label: 'Admin (admin123)', password: 'admin123' },
    { label: 'User (password123)', password: 'password123' }
  ];

  for (const item of passwords) {
    const hash = await security.hashPassword(item.password);
    console.log(`${item.label}:`);
    console.log(`Hash: ${hash}\n`);
  }

  console.log('✅ Password hashes generated successfully!');
  console.log('\n📝 Copy these hashes to backend/database/fileDatabase.js in the initializeDatabase() method');
}

// Run the script
generatePasswordHashes().catch(console.error);
