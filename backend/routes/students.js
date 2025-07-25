// backend/routes/students.js
import express from "express";
import sql from "mssql";
import config from "../config/azureDb.js";

const router = express.Router();


router.get("/:studentId/assignments", async (req, res) => {
  const { studentId } = req.params;

  try {
    const pool = await sql.connect(config);

    const result = await pool.request()
      .input("studentId", sql.Int, studentId)
      .query(`
        SELECT
          a.id AS assignmentId,
          a.course_id AS courseId,
          c.title AS courseTitle,
          a.title AS assignmentTitle,
          a.description,
          a.due_date,
          s.submitted_at,
          s.file_url,
          s.file_name
        FROM dbo.StudentCourses sc
        JOIN dbo.Assignments a ON a.course_id = sc.course_id
        JOIN dbo.Courses c ON c.id = a.course_id
        LEFT JOIN dbo.assignment_submissions s 
          ON s.assignment_id = a.id AND s.student_id = @studentId
        WHERE sc.student_id = @studentId
        ORDER BY c.title, a.due_date;
      `);

    // Group by course
    const grouped = {};

    result.recordset.forEach(row => {
      if (!grouped[row.courseId]) {
        grouped[row.courseId] = {
          courseId: row.courseId,
          courseTitle: row.courseTitle,
          assignments: [],
        };
      }

      const status = row.submitted_at
        ? new Date(row.submitted_at) <= new Date(row.due_date)
          ? "On Time"
          : "Late"
        : "Missing";

      grouped[row.courseId].assignments.push({
        assignmentId: row.assignmentId,
        title: row.assignmentTitle,
        description: row.description,
        dueDate: row.due_date,
        submittedAt: row.submitted_at,
        fileUrl: row.file_url,
        fileName: row.file_name,
        status,
      });
    });

    res.json(Object.values(grouped));
  } catch (err) {
    console.error("Error fetching student assignments:", err);
    res.status(500).json({ error: "Failed to fetch student assignments" });
  }
});


export default router;
