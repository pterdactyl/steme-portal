// routes/assignmentFiles.js
import express from 'express';
import sql from 'mssql';
import config from '../config/azureDb.js';

const router = express.Router();

// GET /api/assignment-files?assignment_id=123
router.get('/', async (req, res) => {
  const { assignment_id } = req.query;

  if (!assignment_id) {
    return res.status(400).json({ error: 'Missing assignment_id query parameter' });
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('assignment_id', sql.Int, assignment_id)
      .query(`
        SELECT id, course_id, assignment_id, file_url, file_name, uploaded_by, uploaded_at
        FROM dbo.assignment_files
        WHERE assignment_id = @assignment_id
        ORDER BY uploaded_at DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching assignment files:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
