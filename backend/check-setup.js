import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

console.log('🔍 Checking OneFlow Backend Setup...\n');

// Check .env file
const envPath = path.join(__dirname, '.env');
console.log('1. Checking .env file...');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('   ✅ .env file exists');
  
  // Check and fix PORT
  if (envContent.includes('PORT=3000')) {
    console.log('   ⚠️  PORT is set to 3000, updating to 3001...');
    const updated = envContent.replace(/PORT=3000/, 'PORT=3001');
    fs.writeFileSync(envPath, updated);
    console.log('   ✅ PORT updated to 3001');
  } else if (envContent.includes('PORT=3001')) {
    console.log('   ✅ PORT is correctly set to 3001');
  } else {
    console.log('   ⚠️  PORT not found, adding PORT=3001...');
    fs.appendFileSync(envPath, '\nPORT=3001\n');
    console.log('   ✅ PORT added');
  }
} else {
  console.log('   ❌ .env file not found, creating...');
  const defaultEnv = `PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=lucky0227
DB_NAME=oneflow_db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
`;
  fs.writeFileSync(envPath, defaultEnv);
  console.log('   ✅ .env file created');
}

// Reload env (already loaded above)

// Check database connection
console.log('\n2. Testing database connection...');
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'oneflow_db',
};

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
    });
    
    console.log('   ✅ MySQL connection successful');
    
    // Check if database exists
    const [databases] = await connection.query('SHOW DATABASES LIKE ?', [dbConfig.database]);
    if (databases.length > 0) {
      console.log(`   ✅ Database '${dbConfig.database}' exists`);
    } else {
      console.log(`   ⚠️  Database '${dbConfig.database}' does not exist`);
      console.log('   💡 Run: npm run init-db');
    }
    
    await connection.end();
    
    console.log('\n✅ Setup check completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Make sure MySQL is running');
    console.log('   2. Run: npm run init-db (if database not initialized)');
    console.log('   3. Run: npm run dev (to start the server)');
    console.log('\n🔐 Default login credentials:');
    console.log('   Admin: admin@oneflow.com / admin123');
    console.log('   PM: pm@oneflow.com / pm123');
    console.log('   Team: team@oneflow.com / team123');
    console.log('   Sales: sales@oneflow.com / sales123');
    
  } catch (error) {
    console.error('   ❌ Database connection failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Make sure MySQL is running');
    console.log('   2. Check DB_HOST, DB_USER, DB_PASSWORD in .env file');
    console.log('   3. Verify MySQL credentials are correct');
    process.exit(1);
  }
})();

