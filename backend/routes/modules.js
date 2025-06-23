import express from 'express';
import { db } from '../server.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all modules
router.get('/', verifyToken, async (req, res) => {
  try {
    const [modules] = await db.execute(
      'SELECT * FROM modules ORDER BY name'
    );
    
    res.json({ modules });
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({ error: 'Failed to get modules' });
  }
});

// Get single module
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [modules] = await db.execute(
      'SELECT * FROM modules WHERE id = ?',
      [id]
    );
    
    if (modules.length === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }
    
    res.json({ module: modules[0] });
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({ error: 'Failed to get module' });
  }
});

// Create module (admin only)
router.post('/', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { name, code, description } = req.body;
    
    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required' });
    }
    
    const [result] = await db.execute(
      'INSERT INTO modules (name, code, description) VALUES (?, ?, ?)',
      [name, code, description]
    );
    
    const [modules] = await db.execute(
      'SELECT * FROM modules WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({ module: modules[0] });
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({ error: 'Failed to create module' });
  }
});

// Update module (admin only)
router.put('/:id', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description } = req.body;
    
    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required' });
    }
    
    await db.execute(
      'UPDATE modules SET name = ?, code = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, code, description, id]
    );
    
    const [modules] = await db.execute(
      'SELECT * FROM modules WHERE id = ?',
      [id]
    );
    
    if (modules.length === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }
    
    res.json({ module: modules[0] });
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({ error: 'Failed to update module' });
  }
});

// Delete module (admin only)
router.delete('/:id', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if module has any submissions
    const [submissions] = await db.execute(
      'SELECT COUNT(*) as count FROM submissions WHERE module_id = ?',
      [id]
    );
    
    if (submissions[0].count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete module with existing submissions' 
      });
    }
    
    await db.execute('DELETE FROM modules WHERE id = ?', [id]);
    
    res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({ error: 'Failed to delete module' });
  }
});

export default router; 