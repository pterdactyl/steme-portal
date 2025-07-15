import express from 'express';
import config from "../config/azureDb.js";
import sql from 'mssql';

const router = express.Router();

// GET assignments by numeric course_id
router.get('/', async (req, res) => {
  const course_id = req.query.course_id;
  console.log(course_id);
  if (!course_id) {
    return res.status(400).json({ error: 'Missing course_id query parameter' });
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('course_id', sql.Int, course_id)
      .query('SELECT * FROM Assignments WHERE course_id = @course_id ORDER BY created_at DESC');

    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create new assignment with numeric course_id
router.post('/', async (req, res) => {
  const { course_id, title, description, due_date } = req.body;

  if (!course_id || !title) {
    return res.status(400).json({ error: 'course_id and title are required' });
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('course_id', sql.Int, course_id)
      .input('title', sql.NVarChar, title)
      .input('description', sql.NVarChar, description || '')
      .input('due_date', sql.DateTime, due_date || null)
      .query(`INSERT INTO Assignments (course_id, title, description, due_date, created_at)
              VALUES (@course_id, @title, @description, @due_date, GETDATE());
              SELECT SCOPE_IDENTITY() AS id;`);

    res.status(201).json({ id: result.recordset[0].id });
  } catch (err) {
    console.error('Error saving assignment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET numeric course_id by course_code
router.get('/course', async (req, res) => {
  const course_code = req.query.course_code;
  console.log(course_code);
  if (!course_code) {
    return res.status(400).json({ error: 'Missing course_code query parameter' });
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('course_code', sql.NVarChar, course_code)
      .query('SELECT id FROM Courses WHERE course_code = @course_code');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ course_id: result.recordset[0].id });
  } catch (err) {
    console.error('Error fetching course:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update an existing assignment by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params; // Get the assignment ID from the URL
  const { course_id, title, description, due_date } = req.body; // Get the updated data from the request body

  // Log incoming data to verify it
  console.log('Updating assignment with ID:', id);
  console.log('Received data:', { course_id, title, description, due_date });

  if (!course_id || !title) {
    return res.status(400).json({ error: 'course_id and title are required' });
  }

  try {
    const pool = await sql.connect(config);
  
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('course_id', sql.Int, course_id)
      .input('title', sql.NVarChar, title)
      .input('description', sql.NVarChar, description || '')
      .input('due_date', sql.DateTime, due_date || null)
      .query(`
        UPDATE Assignments SET
          course_id = @course_id,
          title = @title,
          description = @description,
          due_date = @due_date
          WHERE id = @id
      `);

    // Check if the update query affected any rows
    if (result.rowsAffected[0] === 0) {
      console.log(`No rows updated for assignment ID: ${id}`);
      return res.status(404).json({ error: 'Assignment not found or no changes were made' });
    }

    res.json({ message: 'Assignment updated successfully' });
  } catch (err) {
    // Log the error details for debugging
    console.error('Error updating assignment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE an assignment by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await sql.connect(config);
    
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Assignments WHERE id = @id');

    res.json({ message: 'Assignment deleted successfully' });
  } catch (err) {
    console.error('Error deleting assignment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
