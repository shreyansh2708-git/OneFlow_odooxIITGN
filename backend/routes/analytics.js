import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get analytics data
router.get('/', authenticate, async (req, res) => {
  try {
    // Get projects stats
    const [projects] = await pool.query('SELECT * FROM projects');
    const activeProjects = projects.filter(p => p.status === 'in_progress').length;
    
    // Get tasks stats
    const [tasks] = await pool.query('SELECT * FROM tasks');
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const totalTasks = tasks.length;
    
    // Get total hours from timesheets
    const [timesheetStats] = await pool.query(`
      SELECT SUM(hours) as total_hours
      FROM timesheets
    `);
    const totalHours = parseFloat(timesheetStats[0]?.total_hours || 0);
    
    // Get financial stats
    const [invoices] = await pool.query('SELECT SUM(amount) as total FROM customer_invoices');
    const totalRevenue = parseFloat(invoices[0]?.total || 0);
    
    const [bills] = await pool.query('SELECT SUM(amount) as total FROM vendor_bills');
    const [expenses] = await pool.query('SELECT SUM(amount) as total FROM expenses');
    const totalCost = parseFloat(bills[0]?.total || 0) + parseFloat(expenses[0]?.total || 0);
    const profit = totalRevenue - totalCost;

    // Project progress
    const projectProgress = projects.map(p => ({
      name: p.name,
      progress: p.progress
    }));

    // Resource utilization (simplified - can be enhanced)
    const [timesheets] = await pool.query(`
      SELECT employee, SUM(hours) as total_hours 
      FROM timesheets 
      GROUP BY employee
    `);
    
    const resourceUtilization = timesheets.map(t => ({
      name: t.employee,
      utilization: Math.min(100, Math.round((parseFloat(t.total_hours || 0) / 160) * 100)) // Assuming 160 hours/month
    }));

    // Billable vs non-billable hours
    const [billableStats] = await pool.query(`
      SELECT 
        SUM(CASE WHEN billable = 1 THEN hours ELSE 0 END) as billable_hours,
        SUM(CASE WHEN billable = 0 THEN hours ELSE 0 END) as non_billable_hours
      FROM timesheets
    `);
    
    const billableHours = parseFloat(billableStats[0]?.billable_hours || 0);
    const nonBillableHours = parseFloat(billableStats[0]?.non_billable_hours || 0);

    res.json({
      analytics: {
        totalProjects: projects.length,
        activeProjects,
        completedTasks,
        totalTasks,
        totalHours,
        billableHours,
        nonBillableHours,
        totalRevenue,
        totalCost,
        profit,
        projectProgress,
        resourceUtilization
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

