import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all timesheets
router.get('/', authenticate, async (req, res) => {
  try {
    const { projectId, taskId } = req.query;
    
    let query = `
      SELECT t.*, u.hourly_rate, p.name as project_name
      FROM timesheets t
      LEFT JOIN users u ON t.employee = u.name
      LEFT JOIN projects p ON t.project_id = p.id
    `;
    const params = [];
    const conditions = [];
    
    if (projectId) {
      conditions.push('t.project_id = ?');
      params.push(projectId);
    }
    
    if (taskId) {
      conditions.push('t.task_id = ?');
      params.push(taskId);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY t.created_at DESC';
    
    const [timesheets] = await pool.query(query, params);

    const formatted = timesheets.map(timesheet => {
      const hours = parseFloat(timesheet.hours);
      const hourlyRate = parseFloat(timesheet.hourly_rate || 0);
      const cost = hours * hourlyRate;
      
      return {
        id: timesheet.id.toString(),
        projectId: timesheet.project_id.toString(),
        projectName: timesheet.project_name,
        taskId: timesheet.task_id ? timesheet.task_id.toString() : undefined,
        employee: timesheet.employee,
        date: timesheet.date,
        hours: hours,
        hourlyRate: hourlyRate,
        cost: cost,
        billable: Boolean(timesheet.billable),
        description: timesheet.description || ''
      };
    });

    res.json({ timesheets: formatted });
  } catch (error) {
    console.error('Get timesheets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create timesheet
router.post('/', authenticate, async (req, res) => {
  try {
    const { projectId, taskId, employee, date, hours, billable, description } = req.body;

    if (!projectId || !employee || !date || !hours) {
      return res.status(400).json({ error: 'Required fields: projectId, employee, date, hours' });
    }

    const [result] = await pool.query(
      'INSERT INTO timesheets (project_id, task_id, employee, date, hours, billable, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [projectId, taskId || null, employee, date, hours, billable !== undefined ? billable : true, description || '']
    );

    // Update task hours if taskId is provided
    if (taskId) {
      const [tasks] = await pool.query('SELECT hours_logged FROM tasks WHERE id = ?', [taskId]);
      if (tasks.length > 0) {
        const currentHours = parseFloat(tasks[0].hours_logged) || 0;
        await pool.query('UPDATE tasks SET hours_logged = ? WHERE id = ?', [currentHours + parseFloat(hours), taskId]);
      }
    }

    res.status(201).json({
      message: 'Timesheet created successfully',
      timesheet: {
        id: result.insertId.toString(),
        projectId,
        taskId,
        employee,
        date,
        hours: parseFloat(hours),
        billable: billable !== undefined ? billable : true,
        description: description || ''
      }
    });
  } catch (error) {
    console.error('Create timesheet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update timesheet
router.put('/:id', authenticate, async (req, res) => {
  try {
    const timesheetId = req.params.id;
    const { employee, date, hours, billable, description } = req.body;

    await pool.query(
      'UPDATE timesheets SET employee = ?, date = ?, hours = ?, billable = ?, description = ? WHERE id = ?',
      [employee, date, hours, billable, description, timesheetId]
    );

    res.json({ message: 'Timesheet updated successfully' });
  } catch (error) {
    console.error('Update timesheet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete timesheet
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const timesheetId = req.params.id;
    await pool.query('DELETE FROM timesheets WHERE id = ?', [timesheetId]);
    res.json({ message: 'Timesheet deleted successfully' });
  } catch (error) {
    console.error('Delete timesheet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

