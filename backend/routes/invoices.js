import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all customer invoices
router.get('/', authenticate, async (req, res) => {
  try {
    const { projectId } = req.query;
    
    let query = 'SELECT * FROM customer_invoices';
    const params = [];
    
    if (projectId) {
      query += ' WHERE project_id = ?';
      params.push(projectId);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [invoices] = await pool.query(query, params);

    const formatted = invoices.map(invoice => ({
      id: invoice.id.toString(),
      projectId: invoice.project_id.toString(),
      salesOrderId: invoice.sales_order_id ? invoice.sales_order_id.toString() : undefined,
      number: invoice.number,
      customer: invoice.customer,
      amount: parseFloat(invoice.amount),
      date: invoice.date,
      dueDate: invoice.due_date,
      status: invoice.status,
      description: invoice.description || ''
    }));

    res.json({ customerInvoices: formatted });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create customer invoice
router.post('/', authenticate, async (req, res) => {
  try {
    const { projectId, salesOrderId, number, customer, amount, date, dueDate, status, description } = req.body;

    if (!projectId || !number || !customer || !amount || !date || !dueDate) {
      return res.status(400).json({ error: 'Required fields: projectId, number, customer, amount, date, dueDate' });
    }

    const [result] = await pool.query(
      'INSERT INTO customer_invoices (project_id, sales_order_id, number, customer, amount, date, due_date, status, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [projectId, salesOrderId || null, number, customer, amount, date, dueDate, status || 'draft', description || '']
    );

    res.status(201).json({
      message: 'Invoice created successfully',
      customerInvoice: {
        id: result.insertId.toString(),
        projectId,
        salesOrderId,
        number,
        customer,
        amount,
        date,
        dueDate,
        status: status || 'draft',
        description: description || ''
      }
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update customer invoice
router.put('/:id', authenticate, async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const { number, customer, amount, date, dueDate, status, description } = req.body;

    await pool.query(
      'UPDATE customer_invoices SET number = ?, customer = ?, amount = ?, date = ?, due_date = ?, status = ?, description = ? WHERE id = ?',
      [number, customer, amount, date, dueDate, status, description, invoiceId]
    );

    res.json({ message: 'Invoice updated successfully' });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete customer invoice
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const invoiceId = req.params.id;
    await pool.query('DELETE FROM customer_invoices WHERE id = ?', [invoiceId]);
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

