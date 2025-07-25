// routes/studentAssignments.js
import express from 'express';
import sql from 'mssql';
import config from '../config/azureDb.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { course_id } = req.query;

  console.log('GET /api/student-assignments hit with course_id:', course_id);

  if (!course_id) {
    return res.status(400).json({ error: 'Missing course_id query parameter' });
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('course_id', sql.Int, course_id)
      .query(`
        SELECT id, course_id, title, description, due_date, created_at
        FROM dbo.Assignments
        WHERE course_id = @course_id
        ORDER BY created_at DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
