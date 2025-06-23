import express from 'express';
import { db } from '../server.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all IP usage logs (admin only)
router.get('/', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { submissionId, userId, accessType, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT l.*, 
             u.name as user_name, u.email as user_email,
             s.title as submission_title
      FROM ip_usage_logs l
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN submissions s ON l.submission_id = s.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (submissionId) {
      query += ' AND l.submission_id = ?';
      params.push(submissionId);
    }
    
    if (userId) {
      query += ' AND l.user_id = ?';
      params.push(userId);
    }
    
    if (accessType) {
      query += ' AND l.access_type = ?';
      params.push(accessType);
    }
    
    query += ' ORDER BY l.timestamp DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const [logs] = await db.execute(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM ip_usage_logs WHERE 1=1';
    const countParams = [];
    
    if (submissionId) {
      countQuery += ' AND submission_id = ?';
      countParams.push(submissionId);
    }
    if (userId) {
      countQuery += ' AND user_id = ?';
      countParams.push(userId);
    }
    if (accessType) {
      countQuery += ' AND access_type = ?';
      countParams.push(accessType);
    }
    
    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get IP usage logs error:', error);
    res.status(500).json({ error: 'Failed to get IP usage logs' });
  }
});

// Create IP usage log
router.post('/', verifyToken, async (req, res) => {
  try {
    const { submissionId, accessType, purpose, ipAddress, userAgent } = req.body;
    
    if (!submissionId || !accessType) {
      return res.status(400).json({ error: 'Submission ID and access type are required' });
    }
    
    // Check if submission exists
    const [submissions] = await db.execute(
      'SELECT id FROM submissions WHERE id = ?',
      [submissionId]
    );
    
    if (submissions.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    const [result] = await db.execute(`
      INSERT INTO ip_usage_logs (submission_id, user_id, access_type, purpose, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [submissionId, req.user.id, accessType, purpose, ipAddress, userAgent]);
    
    const [logs] = await db.execute(`
      SELECT l.*, 
             u.name as user_name, u.email as user_email,
             s.title as submission_title
      FROM ip_usage_logs l
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN submissions s ON l.submission_id = s.id
      WHERE l.id = ?
    `, [result.insertId]);
    
    res.status(201).json({ log: logs[0] });
  } catch (error) {
    console.error('Create IP usage log error:', error);
    res.status(500).json({ error: 'Failed to create IP usage log' });
  }
});

// Get IP usage statistics (admin only)
router.get('/stats', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    // Total logs
    const [totalLogs] = await db.execute('SELECT COUNT(*) as total FROM ip_usage_logs');
    
    // Logs by access type
    const [accessTypeStats] = await db.execute(`
      SELECT access_type, COUNT(*) as count 
      FROM ip_usage_logs 
      GROUP BY access_type
    `);
    
    // Recent activity (last 7 days)
    const [recentActivity] = await db.execute(`
      SELECT DATE(timestamp) as date, COUNT(*) as count
      FROM ip_usage_logs 
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
    `);
    
    // Top accessed submissions
    const [topSubmissions] = await db.execute(`
      SELECT s.title, COUNT(l.id) as access_count
      FROM ip_usage_logs l
      JOIN submissions s ON l.submission_id = s.id
      GROUP BY l.submission_id, s.title
      ORDER BY access_count DESC
      LIMIT 10
    `);
    
    res.json({
      totalLogs: totalLogs[0].total,
      accessTypeStats,
      recentActivity,
      topSubmissions
    });
  } catch (error) {
    console.error('Get IP usage stats error:', error);
    res.status(500).json({ error: 'Failed to get IP usage statistics' });
  }
});

// Approve/Reject IP usage log (admin only)
router.put('/:id/approve', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;
    
    await db.execute(
      'UPDATE ip_usage_logs SET approved = ? WHERE id = ?',
      [approved, id]
    );
    
    const [logs] = await db.execute(`
      SELECT l.*, 
             u.name as user_name, u.email as user_email,
             s.title as submission_title
      FROM ip_usage_logs l
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN submissions s ON l.submission_id = s.id
      WHERE l.id = ?
    `, [id]);
    
    if (logs.length === 0) {
      return res.status(404).json({ error: 'IP usage log not found' });
    }
    
    res.json({ log: logs[0] });
  } catch (error) {
    console.error('Update IP usage log error:', error);
    res.status(500).json({ error: 'Failed to update IP usage log' });
  }
});

export default router; 