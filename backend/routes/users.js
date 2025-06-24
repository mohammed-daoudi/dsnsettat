import express from 'express';
import { db } from '../server.js';
import { hybridAuth, hybridRequireRole, hashPassword } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', hybridAuth, hybridRequireRole(['admin']), async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY created_at DESC'
    );

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get single user
router.get('/:id', hybridAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Users can only see their own profile unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [users] = await db.execute(
      'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Create user (admin only)
router.post('/', hybridAuth, hybridRequireRole(['admin']), async (req, res) => {
  try {
    const { name, email, password, role = 'student' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);

    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    const [users] = await db.execute(
      'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({ user: users[0] });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', hybridAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    // Users can only update their own profile unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Only admin can change roles
    if (role && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can change user roles' });
    }

    let updateQuery = 'UPDATE users SET updated_at = CURRENT_TIMESTAMP';
    const params = [];

    if (name) {
      updateQuery += ', name = ?';
      params.push(name);
    }

    if (email) {
      updateQuery += ', email = ?';
      params.push(email);
    }

    if (password) {
      const hashedPassword = await hashPassword(password);
      updateQuery += ', password = ?';
      params.push(hashedPassword);
    }

    if (role && req.user.role === 'admin') {
      updateQuery += ', role = ?';
      params.push(role);
    }

    updateQuery += ' WHERE id = ?';
    params.push(id);

    await db.execute(updateQuery, params);

    const [users] = await db.execute(
      'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/:id', hybridAuth, hybridRequireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has any submissions
    const [submissions] = await db.execute(
      'SELECT COUNT(*) as count FROM submissions WHERE author_id = ?',
      [id]
    );

    if (submissions[0].count > 0) {
      return res.status(400).json({
        error: 'Cannot delete user with existing submissions'
      });
    }

    await db.execute('DELETE FROM users WHERE id = ?', [id]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
