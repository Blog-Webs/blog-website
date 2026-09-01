const mysql = require('mysql2/promise');

const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
const MYSQL_PORT = parseInt(process.env.MYSQL_PORT || '3306', 10);
const MYSQL_USER = process.env.MYSQL_USER || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || '';
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'httptechnex_logs';

let pool = null;
let isInitialized = false;
let hasConnectionFailed = false;

/**
 * Initializes the MySQL database connection pool and ensures schema exists.
 */
async function initMySQL() {
  if (isInitialized || hasConnectionFailed) return pool;

  try {
    // 1. Connect without database to ensure database exists
    const rootConn = await mysql.createConnection({
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
    });

    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\`;`);
    await rootConn.end();

    // 2. Create Connection Pool for MySQL Database
    pool = mysql.createPool({
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      database: MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // 3. Create user_activity_logs table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS user_activity_logs (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NULL,
        user_name VARCHAR(255) NULL,
        user_email VARCHAR(255) NULL,
        auth_provider VARCHAR(50) DEFAULT 'google',
        action_type VARCHAR(50) DEFAULT 'HTTP_REQUEST',
        method VARCHAR(10) NOT NULL,
        url TEXT NOT NULL,
        status_code INT NULL,
        response_time_ms INT NULL,
        ip_address VARCHAR(45) NULL,
        user_agent TEXT NULL,
        extra_metadata JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_user_email (user_email),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    await pool.query(createTableSQL);
    isInitialized = true;
    console.log(`[MySQL Logger] Connected & Table Verified: ${MYSQL_DATABASE}.user_activity_logs`);
    return pool;
  } catch (err) {
    hasConnectionFailed = true;
    console.warn(`[MySQL Logger] Connection unavailable (${err.message}). Logging falling back gracefully.`);
    return null;
  }
}

/**
 * Log a user action / HTTP request into MySQL asynchronously
 */
async function logUserActivity(logData) {
  try {
    if (!isInitialized && !hasConnectionFailed) {
      await initMySQL();
    }
    if (!pool) return;

    const {
      userId = null,
      userName = null,
      userEmail = null,
      authProvider = 'google',
      actionType = 'HTTP_REQUEST',
      method = 'GET',
      url = '/',
      statusCode = null,
      responseTimeMs = null,
      ipAddress = null,
      userAgent = null,
      extraMetadata = null,
    } = logData;

    const insertSQL = `
      INSERT INTO user_activity_logs
      (user_id, user_name, user_email, auth_provider, action_type, method, url, status_code, response_time_ms, ip_address, user_agent, extra_metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const metadataJSON = extraMetadata ? JSON.stringify(extraMetadata) : null;

    await pool.execute(insertSQL, [
      userId ? String(userId) : null,
      userName || null,
      userEmail || null,
      authProvider || 'google',
      actionType || 'HTTP_REQUEST',
      method,
      url,
      statusCode,
      responseTimeMs,
      ipAddress,
      userAgent ? String(userAgent).substring(0, 500) : null,
      metadataJSON,
    ]);
  } catch (err) {
    // Non-blocking log catch
    console.error('[MySQL Logger] Insert Error:', err.message);
  }
}

/**
 * Global Express Middleware for recording HTTP requests into MySQL for every user
 */
function mysqlRequestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Extract user info if authenticated
    const user = req.user || req.account || null;
    const userId = user ? (user._id || user.id || user.googleId || null) : null;
    const userName = user ? (user.name || user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || null) : null;
    const userEmail = user ? (user.email || null) : null;

    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip;

    logUserActivity({
      userId,
      userName,
      userEmail,
      authProvider: user?.authProvider || 'google',
      actionType: 'HTTP_REQUEST',
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTimeMs: duration,
      ipAddress: Array.isArray(ip) ? ip[0] : ip,
      userAgent: req.headers['user-agent'],
    });
  });

  next();
}

module.exports = {
  initMySQL,
  logUserActivity,
  mysqlRequestLogger,
};
