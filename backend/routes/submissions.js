
import express from "express";
import multer from "multer";
import sql from "mssql";
import config from "../config/azureDb.js";
import dotenv from "dotenv";
import {
  BlobServiceClient,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

dotenv.config();

const router = express.Router();

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = "submissions";

const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);
const containerClient = blobServiceClient.getContainerClient(containerName);

// Create container if it does not exist (private container, no public access)
(async () => {
  try {
    await containerClient.createIfNotExists();
    console.log(`Container '${containerName}' is ready.`);
  } catch (err) {
    console.error("Error creating container:", err);
  }
})();

const upload = multer({ storage: multer.memoryStorage() });


// GET secure SAS download URL for a file blob
router.get("/download-url", async (req, res) => {
  const { blobName } = req.query;

  if (!blobName) {
    return res.status(400).json({ error: "Missing blobName" });
  }

  try {
    const expiresOn = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: containerClient.containerName,
        blobName,
        permissions: BlobSASPermissions.parse("r"),
        expiresOn,
      },
      sharedKeyCredential
    ).toString();

    const sasUrl = `https://${accountName}.blob.core.windows.net/${containerClient.containerName}/${blobName}?${sasToken}`;

    res.json({ sasUrl });
  } catch (err) {
    console.error("Error generating SAS URL:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

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
      const blobName = `${Date.now()}-${file.originalname}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: { blobContentType: file.mimetype },
      });

      const fileUrl = blockBlobClient.url;

      await pool.request()
        .input("course_id", sql.Int, courseId)
        .input("assignment_id", sql.Int, assignmentId)
        .input("student_id", sql.Int, userId)
        .input("file_url", sql.NVarChar, fileUrl)
        .input("file_name", sql.NVarChar, file.originalname)
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

router.delete("/unsubmit", async (req, res) => {
  const { course_id, assignment_id, user_id } = req.body;

  if (!course_id || !assignment_id || !user_id) {
    return res.status(400).json({ error: "Missing course_id, assignment_id, or user_id" });
  }

  try {
    const pool = await sql.connect(config);

    // First, get the file URLs and blob names for deletion
    const result = await pool.request()
      .input("course_id", sql.Int, course_id)
      .input("assignment_id", sql.Int, assignment_id)
      .input("student_id", sql.Int, user_id)
      .query(`
        SELECT file_url FROM dbo.assignment_submissions
        WHERE course_id = @course_id AND assignment_id = @assignment_id AND student_id = @student_id
      `);

    const files = result.recordset;

    // Delete files from Azure Blob Storage
    for (const file of files) {
      const blobUrl = file.file_url;
      const blobName = decodeURIComponent(blobUrl.split("/").pop());
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      try {
        await blockBlobClient.deleteIfExists();
      } catch (err) {
        console.warn(`Failed to delete blob '${blobName}':`, err.message);
        // Continue deleting DB entry even if blob delete fails
      }
    }

    // Delete the DB record(s)
    await pool.request()
      .input("course_id", sql.Int, course_id)
      .input("assignment_id", sql.Int, assignment_id)
      .input("student_id", sql.Int, user_id)
      .query(`
        DELETE FROM dbo.assignment_submissions
        WHERE course_id = @course_id AND assignment_id = @assignment_id AND student_id = @student_id
      `);

    res.json({ message: "Submission withdrawn successfully" });
  } catch (err) {
    console.error("Error withdrawing submission:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Get all submissions for a student’s assignment (multiple files)
router.get('/:assignmentId/:studentId', async (req, res) => {
  const { assignmentId, studentId } = req.params;

  try {
    const pool = await sql.connect(config);

    // 1. Get all submissions (files) for the assignment and student
    const submissionsResult = await pool.request()
      .input('assignmentId', sql.Int, assignmentId)
      .input('studentId', sql.Int, studentId)
      .query(`
        SELECT id, file_url, file_name, submitted_at
        FROM assignment_submissions
        WHERE assignment_id = @assignmentId AND student_id = @studentId
        ORDER BY submitted_at DESC
      `);

    const submissions = submissionsResult.recordset; // array of files

    // 2. Get grade (assuming only one grade per assignment/student)
    const gradeResult = await pool.request()
      .input('assignmentId', sql.Int, assignmentId)
      .input('studentId', sql.Int, studentId)
      .query(`
        SELECT grade
        FROM Grades
        WHERE assignment_id = @assignmentId AND student_id = @studentId
      `);

    const grade = gradeResult.recordset[0]?.grade ?? null;

    // Get private comments (from oldest comment to latest)
    const commentsResult = await pool.request()
      .input('assignmentId', sql.Int, assignmentId)
      .input('studentId', sql.Int, studentId)
      .query(`
        SELECT ac.id, ac.message, ac.sender_id, ac.timestamp, u.name AS sender_name
        FROM AssignmentComments ac
        JOIN users u ON ac.sender_id = u.id
        WHERE ac.assignment_id = @assignmentId AND ac.student_id = @studentId
        ORDER BY ac.timestamp ASC
      `);

    res.json({
      files: submissions,  // <-- array of all files
      grade,
      comments: commentsResult.recordset ?? []
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
});

  // Teacher updating a student's submisssion (grade, and comments)
  router.put('/teacher/:assignmentId/:studentId/:teacherId', async (req, res) => {
    const { assignmentId, studentId, teacherId } = req.params;
    const { grade, privateComment } = req.body;
    let transaction;
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
      if (privateComment) {
      // 2. INSERT: Always insert a new private comment if not empty
        await request
          .input('commentAssignmentId', sql.Int, assignmentId)
          .input('commentStudentId', sql.Int, studentId)
          .input('message', sql.NVarChar, privateComment)
          .input('sender', sql.Int, teacherId)
          .query(`
            INSERT INTO AssignmentComments (assignment_id, student_id, message, sender_id)
            VALUES (@commentAssignmentId, @commentStudentId, @message, @sender)
          `);
      }
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
