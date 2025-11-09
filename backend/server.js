import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import projectsRoutes from './routes/projects.js';
import tasksRoutes from './routes/tasks.js';
import salesOrdersRoutes from './routes/salesOrders.js';
import purchaseOrdersRoutes from './routes/purchaseOrders.js';
import invoicesRoutes from './routes/invoices.js';
import vendorBillsRoutes from './routes/vendorBills.js';
import expensesRoutes from './routes/expenses.js';
import timesheetsRoutes from './routes/timesheets.js';
import analyticsRoutes from './routes/analytics.js';
import usersRoutes from './routes/users.js';
import otpRoutes from './routes/otp.js';
import pool from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection error:', err.message);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/sales-orders', salesOrdersRoutes);
app.use('/api/purchase-orders', purchaseOrdersRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/vendor-bills', vendorBillsRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/timesheets', timesheetsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/otp', otpRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'OneFlow API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});

