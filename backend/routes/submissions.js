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

// Get a student’s submissions for an assignment
router.get('/:assignmentId/:studentId', async (req, res) => {
    const { assignmentId, studentId } = req.params;
  
    try {
      const pool = await sql.connect(config);
  
      // 1. Get the latest submission
      const submissionResult = await pool.request()
        .input('assignmentId', sql.Int, assignmentId)
        .input('studentId', sql.Int, studentId)
        .query(`
          SELECT TOP 1 id, file_url, file_name, submitted_at
          FROM assignment_submissions
          WHERE assignment_id = @assignmentId AND student_id = @studentId
          ORDER BY submitted_at DESC
        `);
  
  
      const submission = submissionResult.recordset[0] ?? {};

      // 3. Get grade
      const gradeResult = await pool.request()
        .input('assignmentId', sql.Int, assignmentId)
        .input('studentId', sql.Int, studentId)
        .query(`
          SELECT grade
          FROM Grades
          WHERE assignment_id = @assignmentId AND student_id = @studentId
        `);
  
      const grade = gradeResult.recordset[0]?.grade ?? null;
  
      // 4. Get private comments (latest first)
      const commentsResult = await pool.request()
        .input('assignmentId', sql.Int, assignmentId)
        .input('studentId', sql.Int, studentId)
        .query(`
          SELECT id, message, sender_id, timestamp
          FROM AssignmentComments
          WHERE assignment_id = @assignmentId AND student_id = @studentId
          ORDER BY timestamp DESC
        `);
  
        res.json({
            id: submission.id ?? null,
            file_url: submission.file_url ?? null,
            file_name: submission.file_name ?? null,
            submitted_at: submission.submitted_at ?? null,
            grade,
            comments: commentsResult.recordset ?? []
          });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch submission' });
    }
  });

  // Teacher updating a student's submisssion (grade, and comments)
  router.put('/:assignmentId/:studentId/:teacherId', async (req, res) => {
    const { assignmentId, studentId, teacherId } = req.params;
    const { grade, privateComment } = req.body;
  
    try {
      const pool = await sql.connect(config);
      const transaction = new sql.Transaction(pool);
  
      await transaction.begin();
      const request = new sql.Request(transaction);
  
      // 1. UPSERT: Insert or update grade
      await request
        .input('assignmentId', sql.Int, assignmentId)
        .input('studentId', sql.Int, studentId)
        .input('grade', sql.Int, grade)
        .input('teacherId', sql.Int, teacherId)
        .query(`
          IF EXISTS (
            SELECT 1 FROM Grades
            WHERE assignment_id = @assignmentId AND student_id = @studentId
          )
          BEGIN
            UPDATE Grades
            SET grade = @grade, recorded_by = @teacherId
            WHERE assignment_id = @assignmentId AND student_id = @studentId
          END
          ELSE
          BEGIN
            INSERT INTO Grades (assignment_id, student_id, grade, recorded_by)
            VALUES (@assignmentId, @studentId, @grade, @teacherId)
          END
        `);
  
      // 2. INSERT: Always insert a new private comment
      await request
        .input('commentAssignmentId', sql.Int, assignmentId)
        .input('commentStudentId', sql.Int, studentId)
        .input('message', sql.NVarChar, privateComment)
        .input('sender', sql.Int, teacherId)
        .query(`
          INSERT INTO AssignmentComments (assignment_id, student_id, message, sender)
          VALUES (@commentAssignmentId, @commentStudentId, @message, @sender)
        `);
  
      await transaction.commit();
      res.json({ message: 'Grade and comment saved successfully' });
    } catch (err) {
      console.error(err);
      try {
        if (transaction && !transaction._aborted) {
          await transaction.rollback();
        }
      } catch (rollbackErr) {
        console.error('Rollback failed:', rollbackErr);
      }
      res.status(500).json({ error: 'Failed to update grade and comment' });
    }   
  });
export default router;
