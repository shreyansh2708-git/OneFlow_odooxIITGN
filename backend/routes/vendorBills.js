import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all vendor bills
router.get('/', authenticate, async (req, res) => {
  try {
    const { projectId } = req.query;
    
    let query = 'SELECT * FROM vendor_bills';
    const params = [];
    
    if (projectId) {
      query += ' WHERE project_id = ?';
      params.push(projectId);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [bills] = await pool.query(query, params);

    const formatted = bills.map(bill => ({
      id: bill.id.toString(),
      projectId: bill.project_id.toString(),
      purchaseOrderId: bill.purchase_order_id ? bill.purchase_order_id.toString() : undefined,
      number: bill.number,
      vendor: bill.vendor,
      amount: parseFloat(bill.amount),
      date: bill.date,
      dueDate: bill.due_date,
      status: bill.status,
      description: bill.description || ''
    }));

    res.json({ vendorBills: formatted });
  } catch (error) {
    console.error('Get vendor bills error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create vendor bill
router.post('/', authenticate, async (req, res) => {
  try {
    const { projectId, purchaseOrderId, number, vendor, amount, date, dueDate, status, description } = req.body;

    if (!projectId || !number || !vendor || !amount || !date || !dueDate) {
      return res.status(400).json({ error: 'Required fields: projectId, number, vendor, amount, date, dueDate' });
    }

    const [result] = await pool.query(
      'INSERT INTO vendor_bills (project_id, purchase_order_id, number, vendor, amount, date, due_date, status, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [projectId, purchaseOrderId || null, number, vendor, amount, date, dueDate, status || 'draft', description || '']
    );

    res.status(201).json({
      message: 'Vendor bill created successfully',
      vendorBill: {
        id: result.insertId.toString(),
        projectId,
        purchaseOrderId,
        number,
        vendor,
        amount,
        date,
        dueDate,
        status: status || 'draft',
        description: description || ''
      }
    });
  } catch (error) {
    console.error('Create vendor bill error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update vendor bill
router.put('/:id', authenticate, async (req, res) => {
  try {
    const billId = req.params.id;
    const { number, vendor, amount, date, dueDate, status, description } = req.body;

    await pool.query(
      'UPDATE vendor_bills SET number = ?, vendor = ?, amount = ?, date = ?, due_date = ?, status = ?, description = ? WHERE id = ?',
      [number, vendor, amount, date, dueDate, status, description, billId]
    );

    res.json({ message: 'Vendor bill updated successfully' });
  } catch (error) {
    console.error('Update vendor bill error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete vendor bill
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const billId = req.params.id;
    await pool.query('DELETE FROM vendor_bills WHERE id = ?', [billId]);
    res.json({ message: 'Vendor bill deleted successfully' });
  } catch (error) {
    console.error('Delete vendor bill error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

