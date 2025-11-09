import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'oneflow_db'
};

async function addHourlyRateColumn() {
  let connection;
  try {
    console.log('🔌 Connecting to MySQL...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL');

    // Check if hourly_rate column exists, if not add it
    try {
      const [columns] = await connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'hourly_rate'
      `, [process.env.DB_NAME || 'oneflow_db']);
      
      if (columns.length === 0) {
        await connection.query(`
          ALTER TABLE users 
          ADD COLUMN hourly_rate DECIMAL(10, 2) DEFAULT 0.00
        `);
        console.log('✅ Hourly rate column added to users table');
      } else {
        console.log('✅ Hourly rate column already exists');
      }
    } catch (error) {
      console.error('Error checking/adding hourly_rate column:', error);
      throw error;
    }

    // Update existing users with default hourly rate if null
    await connection.query(`
      UPDATE users 
      SET hourly_rate = 25.00 
      WHERE hourly_rate IS NULL OR hourly_rate = 0
    `);
    console.log('✅ Default hourly rates set for existing users');

    console.log('\n🎉 Database update completed successfully!');

  } catch (error) {
    console.error('❌ Error updating database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addHourlyRateColumn();

