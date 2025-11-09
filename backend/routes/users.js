import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Get all users (for team member selection)
router.get('/', authenticate, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, email, name, role, hourly_rate FROM users ORDER BY name');
    res.json({ 
      users: users.map(u => ({
        id: u.id.toString(),
        email: u.email,
        name: u.name,
        role: u.role,
        hourlyRate: parseFloat(u.hourly_rate || 0)
      }))
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user hourly rate (admin only)
router.put('/:id/hourly-rate', authenticate, async (req, res) => {
  try {
    const userId = req.params.id;
    const { hourlyRate } = req.body;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update hourly rates' });
    }

    if (hourlyRate === undefined || hourlyRate < 0) {
      return res.status(400).json({ error: 'Valid hourly rate is required' });
    }

    await pool.query('UPDATE users SET hourly_rate = ? WHERE id = ?', [hourlyRate, userId]);

    res.json({ message: 'Hourly rate updated successfully' });
  } catch (error) {
    console.error('Update hourly rate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, email, name, role FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: users[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    await pool.query('UPDATE users SET name = ? WHERE id = ?', [name, req.user.id]);
    
    const [users] = await pool.query('SELECT id, email, name, role FROM users WHERE id = ?', [req.user.id]);
    res.json({ message: 'Profile updated successfully', user: users[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
router.put('/password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    // Get user
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

