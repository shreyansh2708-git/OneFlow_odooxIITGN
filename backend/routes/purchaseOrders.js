import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all purchase orders
router.get('/', authenticate, async (req, res) => {
  try {
    const { projectId } = req.query;
    
    let query = 'SELECT * FROM purchase_orders';
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
      vendor: order.vendor,
      amount: parseFloat(order.amount),
      date: order.date,
      status: order.status,
      description: order.description || ''
    }));

    res.json({ purchaseOrders: formatted });
  } catch (error) {
    console.error('Get purchase orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create purchase order
router.post('/', authenticate, async (req, res) => {
  try {
    const { projectId, number, vendor, amount, date, status, description } = req.body;

    if (!projectId || !number || !vendor || !amount || !date) {
      return res.status(400).json({ error: 'Required fields: projectId, number, vendor, amount, date' });
    }

    const [result] = await pool.query(
      'INSERT INTO purchase_orders (project_id, number, vendor, amount, date, status, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [projectId, number, vendor, amount, date, status || 'draft', description || '']
    );

    res.status(201).json({
      message: 'Purchase order created successfully',
      purchaseOrder: {
        id: result.insertId.toString(),
        projectId,
        number,
        vendor,
        amount,
        date,
        status: status || 'draft',
        description: description || ''
      }
    });
  } catch (error) {
    console.error('Create purchase order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update purchase order
router.put('/:id', authenticate, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { number, vendor, amount, date, status, description } = req.body;

    await pool.query(
      'UPDATE purchase_orders SET number = ?, vendor = ?, amount = ?, date = ?, status = ?, description = ? WHERE id = ?',
      [number, vendor, amount, date, status, description, orderId]
    );

    res.json({ message: 'Purchase order updated successfully' });
  } catch (error) {
    console.error('Update purchase order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete purchase order
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const orderId = req.params.id;
    await pool.query('DELETE FROM purchase_orders WHERE id = ?', [orderId]);
    res.json({ message: 'Purchase order deleted successfully' });
  } catch (error) {
    console.error('Delete purchase order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

