import express from "express";
import sql from 'mssql';
const router = express.Router();

import config from "../config/azureDb.js"; 

// Save attendance to the DB
router.post('/', async (req, res) => { 
    const pool = await sql.connect(config);
    const records = req.body; // array of attendance objects
  
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin(); 
  
      for (const record of records) {
        await transaction.request()
          .input("course_id", sql.Int, record.course_id)
          .input("student_id", sql.Int, record.student_id)
          .input("date", sql.Date, record.date)
          .input("status", sql.VarChar, record.status)
          .input("recorded_by", sql.Int, record.recorded_by)
          .query(`
            MERGE INTO AttendanceRecords AS target
            USING (SELECT @course_id AS course_id, @student_id AS student_id, @date AS date) AS source
            ON target.course_id = source.course_id AND target.student_id = source.student_id AND target.date = source.date
            WHEN MATCHED THEN 
              UPDATE SET status = @status, recorded_by = @recorded_by
            WHEN NOT MATCHED THEN
              INSERT (course_id, student_id, date, status, recorded_by)
              VALUES (@course_id, @student_id, @date, @status, @recorded_by);
          `);
      }
  
      await transaction.commit();
      res.status(200).json({ message: "Attendance saved." });
    } catch (error) {
      await transaction.rollback();
      console.error("Error saving attendance:", error);
      res.status(500).json({ error: "Failed to save attendance." });
    }
  });

 // Get all attendance for a course (pivotTable format)
 router.get('/:courseId/all', async (req, res) => {
  const { courseId } = req.params;

  try {
    const pool = await sql.connect(config);

    const result = await pool.request()
      .input('courseId', sql.Int, courseId)
      .query(`
        SELECT 
          ar.student_id,
          u.name AS student_name,
          CONVERT(VARCHAR, ar.date, 23) AS date,
          ar.status
        FROM AttendanceRecords ar
        JOIN users u ON ar.student_id = u.id
        WHERE ar.course_id = @courseId
        ORDER BY u.name, ar.date
      `);

    const records = result.recordset;

    // Pivoting
    const pivotMap = new Map();

    records.forEach(({ student_id, student_name, date, status }) => {
      if (!pivotMap.has(student_id)) {
        pivotMap.set(student_id, {
          student_id,
          student_name,
          attendance: {}
        });
      }
      pivotMap.get(student_id).attendance[date] = status;
    });

    const pivotData = Array.from(pivotMap.values());

    res.json(pivotData);
  } catch (err) {
    console.error("Error generating pivot attendance:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}); 

// Get attendance for a course on a specific date
router.get("/:courseId/:date", async (req, res) => {
    const pool = await sql.connect(config);
    const { courseId, date } = req.params;
    const parsedDate = new Date(date);
    console.log("Received date param:", date);
    console.log("Parsed date:", parsedDate);
    
    if (isNaN(parsedDate)) {
      return res.status(400).json({ error: "Invalid date format" });
    }
    const result = await pool.request()
      .input("courseId", sql.Int, courseId)
      .input("date", sql.Date, new Date(date))
      .query(`
        SELECT student_id, status
        FROM AttendanceRecords
        WHERE course_id = @courseId AND date = @date
      `);
  
    res.json(result.recordset); 
  });

  // GET attendance records for a specific student in a course
router.get('/student/:studentId/course/:courseId', async (req, res) => {
    const { studentId, courseId } = req.params;
   
    try {
      const pool = await sql.connect(config);
      const result = await pool.request()
        .input('studentId', sql.Int, studentId)
        .input('courseId', sql.Int, courseId)
        .query(`
          SELECT id, student_id, course_id, date, status
          FROM AttendanceRecords
          WHERE student_id = @studentId AND course_id = @courseId
          ORDER BY date ASC
        `); 
  
      res.json(result.recordset);
    } catch (err) {
      console.error("Error fetching attendance history:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

 
  
  export default router;