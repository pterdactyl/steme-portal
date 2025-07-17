import express from "express";
import multer from "multer";
import sql from "mssql";
import config from "../config/azureDb.js";
import fs from "fs";

const router = express.Router();

const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post("/upload", upload.array("files"), async (req, res) => {
  const { course_id, assignment_id, user_id } = req.body;
  const files = req.files;

  if (!course_id || !assignment_id || !user_id || !files || files.length === 0) {
    return res.status(400).json({ error: "Missing course_id, assignment_id, user_id, or files" });
  }

  const courseId = parseInt(course_id, 10);
  const assignmentId = parseInt(assignment_id, 10);
  const userId = parseInt(user_id, 10);

  if (isNaN(courseId) || isNaN(assignmentId) || isNaN(userId)) {
    return res.status(400).json({ error: "Invalid course_id, assignment_id or user_id" });
  }

  try {
    const pool = await sql.connect(config);

    for (const file of files) {
      const file_url = `/uploads/${file.filename}`;
      const file_name = file.originalname;

      await pool.request()
        .input("course_id", sql.Int, courseId)
        .input("assignment_id", sql.Int, assignmentId)
        .input("student_id", sql.Int, userId)
        .input("file_url", sql.VarChar, file_url)
        .input("file_name", sql.VarChar, file_name)
        .query(`
          INSERT INTO dbo.assignment_submissions
          (course_id, assignment_id, student_id, file_url, file_name, submitted_at)
          VALUES
          (@course_id, @assignment_id, @student_id, @file_url, @file_name, GETDATE())
        `);
    }

    res.status(201).json({ message: "Submissions uploaded successfully" });
  } catch (err) {
    console.error("Submission upload error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/student/:studentId", async (req, res) => {
  const studentId = parseInt(req.params.studentId, 10);
  if (isNaN(studentId)) {
    return res.status(400).json({ error: "Invalid student ID" });
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input("student_id", sql.Int, studentId)
      .query(`
        SELECT assignment_id, submitted_at, file_url, file_name
        FROM dbo.assignment_submissions
        WHERE student_id = @student_id
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Failed to get submissions:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/submitted-status", async (req, res) => {
  const { course_id, assignment_id, user_id } = req.query;

  if (!course_id || !assignment_id || !user_id) {
    return res.status(400).json({ error: "Missing query parameters" });
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input("course_id", sql.Int, course_id)
      .input("assignment_id", sql.Int, assignment_id)
      .input("student_id", sql.Int, user_id)
      .query(`
        SELECT TOP 1 id FROM dbo.assignment_submissions
        WHERE course_id = @course_id AND assignment_id = @assignment_id AND student_id = @student_id
      `);

    const hasSubmitted = result.recordset.length > 0;
    res.json({ submitted: hasSubmitted });
  } catch (err) {
    console.error("Error checking submission status:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
