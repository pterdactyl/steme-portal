import express from 'express';
import config from "../config/azureDb.js";
import sql from 'mssql';

const router = express.Router();

// GET all grades for a course
router.get('/:courseId', async (req, res) => {
    const { courseId } = req.params;
  
    try {
      const pool = await sql.connect(config);
  
      const result = await pool.request()
        .input('courseId', sql.Int, courseId)
        .query(`
          SELECT 
            g.student_id,
            g.assignment_id,
            g.grade
          FROM Grades g
          JOIN Assignments a ON g.assignment_id = a.id
          WHERE a.course_id = @courseId
        `);
  
      res.json(result.recordset);
    } catch (err) {
      console.error('Error fetching grades:', err);
      res.status(500).json({ error: 'Failed to fetch grades' });
    }
  });

  // POST or update a grade
router.post('/', async (req, res) => {
    const { student_id, assignment_id, grade, recorded_by } = req.body;
  
    if (!student_id || !assignment_id || grade === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    try {
      const pool = await sql.connect(config);
  
      await pool.request()
        .input('student_id', sql.Int, student_id)
        .input('assignment_id', sql.Int, assignment_id)
        .input('grade', sql.Decimal(5, 2), grade)
        .input('recorded_by', sql.Int, recorded_by)
        .query(`
          MERGE INTO Grades AS target
          USING (SELECT @student_id AS student_id, @assignment_id AS assignment_id) AS source
          ON target.student_id = source.student_id AND target.assignment_id = source.assignment_id
          WHEN MATCHED THEN
            UPDATE SET grade = @grade, recorded_at = GETDATE(), recorded_by = @recorded_by
          WHEN NOT MATCHED THEN
            INSERT (student_id, assignment_id, grade, recorded_by)
            VALUES (@student_id, @assignment_id, @grade, @recorded_by);
        `);
  
      res.status(200).json({ message: 'Grade saved successfully' });
    } catch (err) {
      console.error('Error saving grade:', err);
      res.status(500).json({ error: 'Failed to save grade' });
    }
  });
  
  export default router;