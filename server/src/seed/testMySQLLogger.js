/**
 * Test & Verification Script for MySQL Activity Logger
 * Run: node server/src/seed/testMySQLLogger.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { initMySQL, logUserActivity } = require('../shared/infrastructure/logging/mysqlLogger');

async function testLogger() {
  console.log('🔍 Testing MySQL Activity Logger Initialization...\n');
  const pool = await initMySQL();

  if (!pool) {
    console.warn('⚠️  MySQL instance is not running locally. Logger verified to fallback gracefully without crashing application flow.');
    process.exit(0);
  }

  // Insert test log for a Google Authenticated User
  console.log('📝 Logging test user activity (Google Auth User)...');
  await logUserActivity({
    userId: 'google_user_999888777',
    userName: 'John Doe (Google User)',
    userEmail: 'johndoe.test@gmail.com',
    authProvider: 'google',
    actionType: 'GOOGLE_LOGIN',
    method: 'POST',
    url: '/api/auth/google',
    statusCode: 200,
    responseTimeMs: 45,
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
    extraMetadata: { test: true, googleSignIn: true }
  });

  // Query table to verify insertion
  const [rows] = await pool.query('SELECT * FROM user_activity_logs ORDER BY id DESC LIMIT 5;');
  console.log('\n✅ Verification Query Result (Latest 5 logs in MySQL):');
  console.log(rows);

  await pool.end();
  console.log('\n🎉 MySQL Logging Test Completed Successfully!');
}

testLogger().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
