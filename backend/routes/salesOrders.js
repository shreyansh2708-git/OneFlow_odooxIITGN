import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all sales orders
router.get('/', authenticate, async (req, res) => {
  try {
    const { projectId } = req.query;
    
    let query = 'SELECT * FROM sales_orders';
    const params = [];
    
    if (projectId) {
      query += ' WHERE project_id = ?';
      params.push(projectId);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [orders] = await pool.query(query, params);

    const formatted = orders.map(order => ({
      id: order.id.toString(),
      projectId: order.project_id.toString(),
      number: order.number,
      customer: order.customer,
      amount: parseFloat(order.amount),
      date: order.date,
      status: order.status,
      description: order.description || ''
    }));

    res.json({ salesOrders: formatted });
  } catch (error) {
    console.error('Get sales orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create sales order
router.post('/', authenticate, async (req, res) => {
  try {
    const { projectId, number, customer, amount, date, status, description } = req.body;

    if (!projectId || !number || !customer || !amount || !date) {
      return res.status(400).json({ error: 'Required fields: projectId, number, customer, amount, date' });
    }

    const [result] = await pool.query(
      'INSERT INTO sales_orders (project_id, number, customer, amount, date, status, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [projectId, number, customer, amount, date, status || 'draft', description || '']
    );

    res.status(201).json({
      message: 'Sales order created successfully',
      salesOrder: {
        id: result.insertId.toString(),
        projectId,
        number,
        customer,
        amount,
        date,
        status: status || 'draft',
        description: description || ''
      }
    });
  } catch (error) {
    console.error('Create sales order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update sales order
router.put('/:id', authenticate, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { number, customer, amount, date, status, description } = req.body;

    await pool.query(
      'UPDATE sales_orders SET number = ?, customer = ?, amount = ?, date = ?, status = ?, description = ? WHERE id = ?',
      [number, customer, amount, date, status, description, orderId]
    );

    res.json({ message: 'Sales order updated successfully' });
  } catch (error) {
    console.error('Update sales order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete sales order
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const orderId = req.params.id;
    await pool.query('DELETE FROM sales_orders WHERE id = ?', [orderId]);
    res.json({ message: 'Sales order deleted successfully' });
  } catch (error) {
    console.error('Delete sales order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

