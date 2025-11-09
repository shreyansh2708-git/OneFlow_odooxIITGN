import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'oneflow_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  reconnect: true
};

// Validate database config
if (!dbConfig.password && !process.env.DB_PASSWORD) {
  console.warn('⚠️  Warning: DB_PASSWORD is not set. Using empty password.');
}

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection error:', err.message);
  });

export default pool;

