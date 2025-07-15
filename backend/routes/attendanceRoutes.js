import express from 'express';
import sql from 'mssql';

const router = express.Router();

// Get courses for a teacher
router.get('/courses', async (req, res) => {
  const { teacherId } = req.query;
  if (!teacherId) return res.status(400).send('teacherId is required');

  try {
    const pool = await sql.connect({
      user: process.env.AZURE_SQL_USER,
      password: process.env.AZURE_SQL_PASSWORD,
      database: process.env.AZURE_SQL_DATABASE,
      server: process.env.AZURE_SQL_SERVER,
      options: {
        encrypt: true,
        trustServerCertificate: false,
      },
    });

    const result = await pool.request()
      .input('teacherId', sql.Int, teacherId)
      .query('SELECT id, title FROM Courses WHERE teacherId = @teacherId');

    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).send('Internal server error');
  }
});

// Get students for a course
router.get('/students', async (req, res) => {
  const { courseId } = req.query;
  if (!courseId) return res.status(400).send('courseId is required');

  try {
    const pool = await sql.connect({
      user: process.env.AZURE_SQL_USER,
      password: process.env.AZURE_SQL_PASSWORD,
      database: process.env.AZURE_SQL_DATABASE,
      server: process.env.AZURE_SQL_SERVER,
      options: {
        encrypt: true,
        trustServerCertificate: false,
      },
    });

    const result = await pool.request()
      .input('courseId', sql.Int, courseId)
      .query('SELECT id, fullName, email FROM Students WHERE courseId = @courseId');

    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).send('Internal server error');
  }
});

// Get attendance by course and date
router.get('/attendance', async (req, res) => {
  const { courseId, date } = req.query;
  if (!courseId || !date) return res.status(400).send('courseId and date are required');

  try {
    const pool = await sql.connect({
      user: process.env.AZURE_SQL_USER,
      password: process.env.AZURE_SQL_PASSWORD,
      database: process.env.AZURE_SQL_DATABASE,
      server: process.env.AZURE_SQL_SERVER,
      options: {
        encrypt: true,
        trustServerCertificate: false,
      },
    });

    const result = await pool.request()
      .input('courseId', sql.Int, courseId)
      .input('date', sql.Date, date)
      .query('SELECT studentId, status FROM Attendance WHERE courseId = @courseId AND date = @date');

    const attendanceMap = {};
    result.recordset.forEach(row => {
      attendanceMap[row.studentId] = row.status;
    });

    res.json(attendanceMap);
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).send('Internal server error');
  }
});

// Save attendance (insert or update)
router.post('/attendance', async (req, res) => {
  const { courseId, date, attendance } = req.body;
  if (!courseId || !date || !attendance) return res.status(400).send('Missing fields');

  try {
    const pool = await sql.connect({
      user: process.env.AZURE_SQL_USER,
      password: process.env.AZURE_SQL_PASSWORD,
      database: process.env.AZURE_SQL_DATABASE,
      server: process.env.AZURE_SQL_SERVER,
      options: {
        encrypt: true,
        trustServerCertificate: false,
      },
    });

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    for (const [studentId, status] of Object.entries(attendance)) {
      const request = new sql.Request(transaction);
      await request
        .input('courseId', sql.Int, courseId)
        .input('date', sql.Date, date)
        .input('studentId', sql.Int, studentId)
        .input('status', sql.VarChar, status)
        .query(`
          MERGE Attendance AS target
          USING (SELECT @courseId AS courseId, @date AS date, @studentId AS studentId) AS source
          ON (target.courseId = source.courseId AND target.date = source.date AND target.studentId = source.studentId)
          WHEN MATCHED THEN
            UPDATE SET status = @status
          WHEN NOT MATCHED THEN
            INSERT (courseId, date, studentId, status)
            VALUES (@courseId, @date, @studentId, @status);
        `);
    }

    await transaction.commit();
    res.send('Attendance saved successfully!');
  } catch (err) {
    console.error('Error saving attendance:', err);
    res.status(500).send('Internal server error');
  }
});

export default router;
