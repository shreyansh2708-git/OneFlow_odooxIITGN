import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

async function initDatabase() {
  let connection;
  try {
    console.log('🔌 Connecting to MySQL...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL');

    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'oneflow_db'}`);
    console.log('✅ Database created/verified');

    // Use database
    await connection.query(`USE ${process.env.DB_NAME || 'oneflow_db'}`);
    console.log('✅ Using database');

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role ENUM('admin', 'project_manager', 'team_member', 'sales_finance') NOT NULL DEFAULT 'team_member',
        hourly_rate DECIMAL(10, 2) DEFAULT 25.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');
    
    // Add hourly_rate column if it doesn't exist (for existing databases)
    try {
      const [columns] = await connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'hourly_rate'
      `);
      
      if (columns.length === 0) {
        await connection.query(`
          ALTER TABLE users 
          ADD COLUMN hourly_rate DECIMAL(10, 2) DEFAULT 25.00
        `);
        console.log('✅ Hourly rate column added to users table');
      }
    } catch (error) {
      // Column might already exist, ignore error
      console.log('⚠️  Hourly rate column check skipped');
    }

    // Create projects table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status ENUM('planned', 'in_progress', 'completed', 'on_hold') NOT NULL DEFAULT 'planned',
        manager VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        budget DECIMAL(15, 2) NOT NULL DEFAULT 0,
        spent DECIMAL(15, 2) NOT NULL DEFAULT 0,
        progress INT NOT NULL DEFAULT 0,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Projects table created');

    // Create project_team table (many-to-many relationship)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS project_team (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_project_user (project_id, user_id)
      )
    `);
    console.log('✅ Project team table created');

    // Create tasks table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        assignee VARCHAR(255) NOT NULL,
        status ENUM('new', 'in_progress', 'blocked', 'done') NOT NULL DEFAULT 'new',
        priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
        due_date DATE NOT NULL,
        hours_logged DECIMAL(10, 2) NOT NULL DEFAULT 0,
        estimated_hours DECIMAL(10, 2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tasks table created');

    // Create sales_orders table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sales_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        number VARCHAR(100) UNIQUE NOT NULL,
        customer VARCHAR(255) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        date DATE NOT NULL,
        status ENUM('draft', 'confirmed', 'invoiced') NOT NULL DEFAULT 'draft',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Sales orders table created');

    // Create purchase_orders table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        number VARCHAR(100) UNIQUE NOT NULL,
        vendor VARCHAR(255) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        date DATE NOT NULL,
        status ENUM('draft', 'confirmed', 'billed') NOT NULL DEFAULT 'draft',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Purchase orders table created');

    // Create customer_invoices table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS customer_invoices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        sales_order_id INT,
        number VARCHAR(100) UNIQUE NOT NULL,
        customer VARCHAR(255) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        date DATE NOT NULL,
        due_date DATE NOT NULL,
        status ENUM('draft', 'sent', 'paid') NOT NULL DEFAULT 'draft',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Customer invoices table created');

    // Create vendor_bills table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS vendor_bills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        purchase_order_id INT,
        number VARCHAR(100) UNIQUE NOT NULL,
        vendor VARCHAR(255) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        date DATE NOT NULL,
        due_date DATE NOT NULL,
        status ENUM('draft', 'confirmed', 'paid') NOT NULL DEFAULT 'draft',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Vendor bills table created');

    // Create expenses table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        employee VARCHAR(255) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        date DATE NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        billable BOOLEAN NOT NULL DEFAULT false,
        status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
        receipt VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Expenses table created');

    // Create timesheets table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS timesheets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        task_id INT,
        employee VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        hours DECIMAL(10, 2) NOT NULL,
        billable BOOLEAN NOT NULL DEFAULT true,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Timesheets table created');

    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const [users] = await connection.query('SELECT * FROM users WHERE email = ?', ['admin@oneflow.com']);
    
    if (users.length === 0) {
      await connection.query(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        ['admin@oneflow.com', hashedPassword, 'Admin User', 'admin']
      );
      console.log('✅ Default admin user created (admin@oneflow.com / admin123)');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Create demo users
    const demoUsers = [
      ['pm@oneflow.com', 'pm123', 'Project Manager', 'project_manager'],
      ['team@oneflow.com', 'team123', 'Team Member', 'team_member'],
      ['sales@oneflow.com', 'sales123', 'Sales User', 'sales_finance']
    ];

    for (const [email, password, name, role] of demoUsers) {
      const [existing] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
      if (existing.length === 0) {
        const hashed = await bcrypt.hash(password, 10);
        await connection.query(
          'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
          [email, hashed, name, role]
        );
        console.log(`✅ Demo user created: ${email} / ${password}`);
      }
    }

    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n📝 Default login credentials:');
    console.log('   Admin: admin@oneflow.com / admin123');
    console.log('   PM: pm@oneflow.com / pm123');
    console.log('   Team: team@oneflow.com / team123');
    console.log('   Sales: sales@oneflow.com / sales123');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();

