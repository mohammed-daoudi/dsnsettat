import express from 'express';
import { db } from '../server.js';
import { hybridAuth, hybridRequireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all professors
router.get('/', hybridAuth, async (req, res) => {
  try {
    const [professors] = await db.execute(
      'SELECT * FROM professors ORDER BY name'
    );

    res.json({ professors });
  } catch (error) {
    console.error('Get professors error:', error);
    res.status(500).json({ error: 'Failed to get professors' });
  }
});

// Get single professor
router.get('/:id', hybridAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [professors] = await db.execute(
      'SELECT * FROM professors WHERE id = ?',
      [id]
    );

    if (professors.length === 0) {
      return res.status(404).json({ error: 'Professor not found' });
    }

    res.json({ professor: professors[0] });
  } catch (error) {
    console.error('Get professor error:', error);
    res.status(500).json({ error: 'Failed to get professor' });
  }
});

// Create professor (admin only)
router.post('/', hybridAuth, hybridRequireRole(['admin']), async (req, res) => {
  try {
    const { name, email, department } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const [result] = await db.execute(
      'INSERT INTO professors (name, email, department) VALUES (?, ?, ?)',
      [name, email, department]
    );

    const [professors] = await db.execute(
      'SELECT * FROM professors WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({ professor: professors[0] });
  } catch (error) {
    console.error('Create professor error:', error);
    res.status(500).json({ error: 'Failed to create professor' });
  }
});

// Update professor (admin only)
router.put('/:id', hybridAuth, hybridRequireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    await db.execute(
      'UPDATE professors SET name = ?, email = ?, department = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, email, department, id]
    );

    const [professors] = await db.execute(
      'SELECT * FROM professors WHERE id = ?',
      [id]
    );

    if (professors.length === 0) {
      return res.status(404).json({ error: 'Professor not found' });
    }

    res.json({ professor: professors[0] });
  } catch (error) {
    console.error('Update professor error:', error);
    res.status(500).json({ error: 'Failed to update professor' });
  }
});

// Delete professor (admin only)
router.delete('/:id', hybridAuth, hybridRequireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if professor has any submissions
    const [submissions] = await db.execute(
      'SELECT COUNT(*) as count FROM submissions WHERE supervisor_id = ?',
      [id]
    );

    if (submissions[0].count > 0) {
      return res.status(400).json({
        error: 'Cannot delete professor with existing submissions'
      });
    }

    await db.execute('DELETE FROM professors WHERE id = ?', [id]);

    res.json({ message: 'Professor deleted successfully' });
  } catch (error) {
    console.error('Delete professor error:', error);
    res.status(500).json({ error: 'Failed to delete professor' });
  }
});

export default router;
