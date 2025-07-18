
import express from "express";
import multer from "multer";
import sql from "mssql";
import config from "../config/azureDb.js";
import { BlobServiceClient } from "@azure/storage-blob";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

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


export default router;
