import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all expenses
router.get('/', authenticate, async (req, res) => {
  try {
    const { projectId } = req.query;
    
    let query = 'SELECT * FROM expenses';
    const params = [];
    
    if (projectId) {
      query += ' WHERE project_id = ?';
      params.push(projectId);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [expenses] = await pool.query(query, params);

    const formatted = expenses.map(expense => ({
      id: expense.id.toString(),
      projectId: expense.project_id.toString(),
      employee: expense.employee,
      amount: parseFloat(expense.amount),
      date: expense.date,
      category: expense.category,
      description: expense.description || '',
      billable: Boolean(expense.billable),
      status: expense.status,
      receipt: expense.receipt || undefined
    }));

    res.json({ expenses: formatted });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create expense
router.post('/', authenticate, async (req, res) => {
  try {
    const { projectId, employee, amount, date, category, description, billable, status, receipt } = req.body;

    if (!projectId || !employee || !amount || !date || !category) {
      return res.status(400).json({ error: 'Required fields: projectId, employee, amount, date, category' });
    }

    const [result] = await pool.query(
      'INSERT INTO expenses (project_id, employee, amount, date, category, description, billable, status, receipt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [projectId, employee, amount, date, category, description || '', billable || false, status || 'pending', receipt || null]
    );

    res.status(201).json({
      message: 'Expense created successfully',
      expense: {
        id: result.insertId.toString(),
        projectId,
        employee,
        amount,
        date,
        category,
        description: description || '',
        billable: billable || false,
        status: status || 'pending',
        receipt: receipt || undefined
      }
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update expense
router.put('/:id', authenticate, async (req, res) => {
  try {
    const expenseId = req.params.id;
    const { employee, amount, date, category, description, billable, status, receipt } = req.body;

    await pool.query(
      'UPDATE expenses SET employee = ?, amount = ?, date = ?, category = ?, description = ?, billable = ?, status = ?, receipt = ? WHERE id = ?',
      [employee, amount, date, category, description, billable, status, receipt, expenseId]
    );

    res.json({ message: 'Expense updated successfully' });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete expense
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const expenseId = req.params.id;
    await pool.query('DELETE FROM expenses WHERE id = ?', [expenseId]);
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

