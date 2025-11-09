import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all projects
router.get('/', authenticate, async (req, res) => {
  try {
    const [projects] = await pool.query(`
      SELECT p.*, 
        GROUP_CONCAT(DISTINCT u.name) as team_names
      FROM projects p
      LEFT JOIN project_team pt ON p.id = pt.project_id
      LEFT JOIN users u ON pt.user_id = u.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);

    // Format projects with team array
    const formattedProjects = projects.map(project => ({
      id: project.id.toString(),
      name: project.name,
      description: project.description || '',
      status: project.status,
      manager: project.manager,
      team: project.team_names ? project.team_names.split(',') : [],
      startDate: project.start_date,
      endDate: project.end_date,
      budget: parseFloat(project.budget),
      spent: parseFloat(project.spent),
      progress: project.progress
    }));

    res.json({ projects: formattedProjects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single project
router.get('/:id', authenticate, async (req, res) => {
  try {
    const projectId = req.params.id;

    const [projects] = await pool.query('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projects[0];

    // Get team members
    const [teamMembers] = await pool.query(`
      SELECT u.name 
      FROM project_team pt
      JOIN users u ON pt.user_id = u.id
      WHERE pt.project_id = ?
    `, [projectId]);

    res.json({
      project: {
        id: project.id.toString(),
        name: project.name,
        description: project.description || '',
        status: project.status,
        manager: project.manager,
        team: teamMembers.map(m => m.name),
        startDate: project.start_date,
        endDate: project.end_date,
        budget: parseFloat(project.budget),
        spent: parseFloat(project.spent),
        progress: project.progress
      }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create project
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, status, manager, team, startDate, endDate, budget, spent, progress } = req.body;

    if (!name || !manager || !startDate || !endDate) {
      return res.status(400).json({ error: 'Required fields: name, manager, startDate, endDate' });
    }

    const [result] = await pool.query(
      'INSERT INTO projects (name, description, status, manager, start_date, end_date, budget, spent, progress, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description || '', status || 'planned', manager, startDate, endDate, budget || 0, spent || 0, progress || 0, req.user.id]
    );

    const projectId = result.insertId;

    // Add team members if provided
    let teamMembers = [];
    if (team && Array.isArray(team) && team.length > 0) {
      // Get user IDs from names
      const placeholders = team.map(() => '?').join(',');
      const [users] = await pool.query(`SELECT id, name FROM users WHERE name IN (${placeholders})`, team);
      
      for (const user of users) {
        await pool.query('INSERT INTO project_team (project_id, user_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE project_id=project_id', [projectId, user.id]);
        teamMembers.push(user.name);
      }
    }

    // Get the created project with team
    const [projects] = await pool.query(`
      SELECT p.*, 
        GROUP_CONCAT(DISTINCT u.name) as team_names
      FROM projects p
      LEFT JOIN project_team pt ON p.id = pt.project_id
      LEFT JOIN users u ON pt.user_id = u.id
      WHERE p.id = ?
      GROUP BY p.id
    `, [projectId]);

    const createdProject = projects[0];

    res.status(201).json({
      message: 'Project created successfully',
      project: {
        id: createdProject.id.toString(),
        name: createdProject.name,
        description: createdProject.description || '',
        status: createdProject.status,
        manager: createdProject.manager,
        team: createdProject.team_names ? createdProject.team_names.split(',') : [],
        startDate: createdProject.start_date,
        endDate: createdProject.end_date,
        budget: parseFloat(createdProject.budget),
        spent: parseFloat(createdProject.spent),
        progress: createdProject.progress
      }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update project
router.put('/:id', authenticate, async (req, res) => {
  try {
    const projectId = req.params.id;
    const { name, description, status, manager, team, startDate, endDate, budget, spent, progress } = req.body;

    // Check if project exists
    const [existingProjects] = await pool.query('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (existingProjects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Update project
    await pool.query(
      'UPDATE projects SET name = ?, description = ?, status = ?, manager = ?, start_date = ?, end_date = ?, budget = ?, spent = ?, progress = ? WHERE id = ?',
      [name, description, status, manager, startDate, endDate, budget, spent, progress, projectId]
    );

    // Update team members
    if (team && Array.isArray(team)) {
      // Remove existing team members
      await pool.query('DELETE FROM project_team WHERE project_id = ?', [projectId]);
      
      // Add new team members
      if (team.length > 0) {
        const placeholders = team.map(() => '?').join(',');
        const [users] = await pool.query(`SELECT id, name FROM users WHERE name IN (${placeholders})`, team);
        
        for (const user of users) {
          await pool.query('INSERT INTO project_team (project_id, user_id) VALUES (?, ?)', [projectId, user.id]);
        }
      }
    }

    // Get updated project with team
    const [updatedProjects] = await pool.query(`
      SELECT p.*, 
        GROUP_CONCAT(DISTINCT u.name) as team_names
      FROM projects p
      LEFT JOIN project_team pt ON p.id = pt.project_id
      LEFT JOIN users u ON pt.user_id = u.id
      WHERE p.id = ?
      GROUP BY p.id
    `, [projectId]);

    const updatedProject = updatedProjects[0];

    res.json({ 
      message: 'Project updated successfully',
      project: {
        id: updatedProject.id.toString(),
        name: updatedProject.name,
        description: updatedProject.description || '',
        status: updatedProject.status,
        manager: updatedProject.manager,
        team: updatedProject.team_names ? updatedProject.team_names.split(',') : [],
        startDate: updatedProject.start_date,
        endDate: updatedProject.end_date,
        budget: parseFloat(updatedProject.budget),
        spent: parseFloat(updatedProject.spent),
        progress: updatedProject.progress
      }
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete project
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const projectId = req.params.id;

    const [projects] = await pool.query('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await pool.query('DELETE FROM projects WHERE id = ?', [projectId]);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

