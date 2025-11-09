import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all tasks
router.get('/', authenticate, async (req, res) => {
  try {
    const { projectId } = req.query;
    
    let query = 'SELECT * FROM tasks';
    const params = [];
    
    if (projectId) {
      query += ' WHERE project_id = ?';
      params.push(projectId);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [tasks] = await pool.query(query, params);

    const formattedTasks = tasks.map(task => ({
      id: task.id.toString(),
      projectId: task.project_id.toString(),
      title: task.title,
      description: task.description || '',
      assignee: task.assignee,
      status: task.status,
      priority: task.priority,
      dueDate: task.due_date,
      hoursLogged: parseFloat(task.hours_logged),
      estimatedHours: parseFloat(task.estimated_hours)
    }));

    res.json({ tasks: formattedTasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single task
router.get('/:id', authenticate, async (req, res) => {
  try {
    const taskId = req.params.id;

    const [tasks] = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = tasks[0];

    res.json({
      task: {
        id: task.id.toString(),
        projectId: task.project_id.toString(),
        title: task.title,
        description: task.description || '',
        assignee: task.assignee,
        status: task.status,
        priority: task.priority,
        dueDate: task.due_date,
        hoursLogged: parseFloat(task.hours_logged),
        estimatedHours: parseFloat(task.estimated_hours)
      }
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create task
router.post('/', authenticate, async (req, res) => {
  try {
    const { projectId, title, description, assignee, status, priority, dueDate, hoursLogged, estimatedHours } = req.body;

    if (!projectId || !title || !assignee || !dueDate) {
      return res.status(400).json({ error: 'Required fields: projectId, title, assignee, dueDate' });
    }

    const [result] = await pool.query(
      'INSERT INTO tasks (project_id, title, description, assignee, status, priority, due_date, hours_logged, estimated_hours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [projectId, title, description || '', assignee, status || 'new', priority || 'medium', dueDate, hoursLogged || 0, estimatedHours || 0]
    );

    res.status(201).json({
      message: 'Task created successfully',
      task: {
        id: result.insertId.toString(),
        projectId,
        title,
        description: description || '',
        assignee,
        status: status || 'new',
        priority: priority || 'medium',
        dueDate,
        hoursLogged: hoursLogged || 0,
        estimatedHours: estimatedHours || 0
      }
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update task
router.put('/:id', authenticate, async (req, res) => {
  try {
    const taskId = req.params.id;
    const { title, description, assignee, status, priority, dueDate, hoursLogged, estimatedHours } = req.body;

    const [tasks] = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await pool.query(
      'UPDATE tasks SET title = ?, description = ?, assignee = ?, status = ?, priority = ?, due_date = ?, hours_logged = ?, estimated_hours = ? WHERE id = ?',
      [title, description, assignee, status, priority, dueDate, hoursLogged, estimatedHours, taskId]
    );

    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete task
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const taskId = req.params.id;

    const [tasks] = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await pool.query('DELETE FROM tasks WHERE id = ?', [taskId]);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

