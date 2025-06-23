import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { db } from '../server.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    // Allow PDF, DOC, DOCX files
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
    }
  }
});

// Get all submissions (with filters)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, authorId, supervisorId, moduleId, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT s.*, 
             u.name as author_name, u.email as author_email,
             p.name as supervisor_name,
             m.name as module_name, m.code as module_code
      FROM submissions s
      LEFT JOIN users u ON s.author_id = u.id
      LEFT JOIN professors p ON s.supervisor_id = p.id
      LEFT JOIN modules m ON s.module_id = m.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND s.status = ?';
      params.push(status);
    }
    
    if (authorId) {
      query += ' AND s.author_id = ?';
      params.push(authorId);
    }
    
    if (supervisorId) {
      query += ' AND s.supervisor_id = ?';
      params.push(supervisorId);
    }
    
    if (moduleId) {
      query += ' AND s.module_id = ?';
      params.push(moduleId);
    }
    
    // Add pagination
    query += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const [submissions] = await db.execute(query, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM submissions WHERE 1=1';
    const countParams = [];
    
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    if (authorId) {
      countQuery += ' AND author_id = ?';
      countParams.push(authorId);
    }
    if (supervisorId) {
      countQuery += ' AND supervisor_id = ?';
      countParams.push(supervisorId);
    }
    if (moduleId) {
      countQuery += ' AND module_id = ?';
      countParams.push(moduleId);
    }
    
    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Failed to get submissions' });
  }
});

// Get single submission
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [submissions] = await db.execute(`
      SELECT s.*, 
             u.name as author_name, u.email as author_email,
             p.name as supervisor_name,
             m.name as module_name, m.code as module_code
      FROM submissions s
      LEFT JOIN users u ON s.author_id = u.id
      LEFT JOIN professors p ON s.supervisor_id = p.id
      LEFT JOIN modules m ON s.module_id = m.id
      WHERE s.id = ?
    `, [id]);
    
    if (submissions.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    res.json({ submission: submissions[0] });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ error: 'Failed to get submission' });
  }
});

// Create new submission
router.post('/', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const { title, description, supervisorId, moduleId } = req.body;
    const file = req.file;
    
    if (!title || !description || !supervisorId || !moduleId) {
      return res.status(400).json({ error: 'Title, description, supervisor, and module are required' });
    }
    
    if (!file) {
      return res.status(400).json({ error: 'File is required' });
    }
    
    const fileUrl = `/uploads/${file.filename}`;
    
    const [result] = await db.execute(`
      INSERT INTO submissions (title, description, file_url, file_name, file_size, author_id, supervisor_id, module_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, description, fileUrl, file.originalname, file.size, req.user.id, supervisorId, moduleId]);
    
    const [submissions] = await db.execute(`
      SELECT s.*, 
             u.name as author_name, u.email as author_email,
             p.name as supervisor_name,
             m.name as module_name, m.code as module_code
      FROM submissions s
      LEFT JOIN users u ON s.author_id = u.id
      LEFT JOIN professors p ON s.supervisor_id = p.id
      LEFT JOIN modules m ON s.module_id = m.id
      WHERE s.id = ?
    `, [result.insertId]);
    
    res.status(201).json({ submission: submissions[0] });
  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({ error: 'Failed to create submission' });
  }
});

// Update submission
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    
    // Check if submission exists and user has permission
    const [submissions] = await db.execute(
      'SELECT * FROM submissions WHERE id = ?',
      [id]
    );
    
    if (submissions.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    const submission = submissions[0];
    
    // Only author can update title/description, only admin/teacher can update status
    if (req.user.role === 'student' && submission.author_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only update your own submissions' });
    }
    
    let updateQuery = 'UPDATE submissions SET updated_at = CURRENT_TIMESTAMP';
    const params = [];
    
    if (title) {
      updateQuery += ', title = ?';
      params.push(title);
    }
    
    if (description) {
      updateQuery += ', description = ?';
      params.push(description);
    }
    
    if (status && ['admin', 'teacher'].includes(req.user.role)) {
      updateQuery += ', status = ?';
      params.push(status);
    }
    
    updateQuery += ' WHERE id = ?';
    params.push(id);
    
    await db.execute(updateQuery, params);
    
    // Get updated submission
    const [updatedSubmissions] = await db.execute(`
      SELECT s.*, 
             u.name as author_name, u.email as author_email,
             p.name as supervisor_name,
             m.name as module_name, m.code as module_code
      FROM submissions s
      LEFT JOIN users u ON s.author_id = u.id
      LEFT JOIN professors p ON s.supervisor_id = p.id
      LEFT JOIN modules m ON s.module_id = m.id
      WHERE s.id = ?
    `, [id]);
    
    res.json({ submission: updatedSubmissions[0] });
  } catch (error) {
    console.error('Update submission error:', error);
    res.status(500).json({ error: 'Failed to update submission' });
  }
});

// Delete submission
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if submission exists and user has permission
    const [submissions] = await db.execute(
      'SELECT * FROM submissions WHERE id = ?',
      [id]
    );
    
    if (submissions.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    const submission = submissions[0];
    
    // Only author or admin can delete
    if (req.user.role !== 'admin' && submission.author_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own submissions' });
    }
    
    await db.execute('DELETE FROM submissions WHERE id = ?', [id]);
    
    res.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({ error: 'Failed to delete submission' });
  }
});

// Download submission file
router.get('/:id/download', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get submission details
    const [submissions] = await db.execute(`
      SELECT s.*, 
             u.name as author_name, u.email as author_email,
             p.name as supervisor_name,
             m.name as module_name, m.code as module_code
      FROM submissions s
      LEFT JOIN users u ON s.author_id = u.id
      LEFT JOIN professors p ON s.supervisor_id = p.id
      LEFT JOIN modules m ON s.module_id = m.id
      WHERE s.id = ?
    `, [id]);
    
    if (submissions.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    const submission = submissions[0];
    
    // Check permissions: author, supervisor, or admin can download
    const canDownload = req.user.role === 'admin' || 
                       submission.author_id === req.user.id ||
                       submission.supervisor_id === req.user.id;
    
    if (!canDownload) {
      return res.status(403).json({ error: 'You do not have permission to download this file' });
    }
    
    // Log the download attempt
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'];
    
    await db.execute(`
      INSERT INTO ip_usage_logs (submission_id, user_id, access_type, ip_address, user_agent, purpose, approved)
      VALUES (?, ?, 'download', ?, ?, 'File download', true)
    `, [id, req.user.id, ipAddress, userAgent]);
    
    // Get file path
    const filePath = join(__dirname, '..', submission.file_url);
    
    // Check if file exists
    const fs = await import('fs');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }
    
    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${submission.file_name}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', submission.file_size);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Download submission error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

export default router; 