import express from 'express';
import config from "../config/azureDb.js";
import sql from 'mssql';
import multer from "multer";
import containerClient from "../blobClient.js";
import {
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

const router = express.Router();

// Setup for Azure SAS generation
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

// Multer memory storage for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// GET assignments by numeric course_id
router.get('/', async (req, res) => {
  const course_id = req.query.course_id;

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

// POST create new assignment with file uploads
router.post('/', upload.array("files"), async (req, res) => {
  const { course_id, title, description, due_date, uploaded_by } = req.body;
  const files = req.files;

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

    const assignmentId = result.recordset[0].id;

    for (const file of files) {
      const blobName = `${Date.now()}-${file.originalname}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: { blobContentType: file.mimetype },
      });

      const fileUrl = blockBlobClient.url;

      await pool.request()
        .input("course_id", sql.Int, course_id)
        .input("assignment_id", sql.Int, assignmentId)
        .input("file_url", sql.NVarChar, fileUrl)
        .input("file_name", sql.NVarChar, file.originalname)
        .input("uploaded_by", sql.NVarChar, uploaded_by)
        .input("uploaded_at", sql.DateTime, new Date())
        .query(`
          INSERT INTO assignment_files (course_id, assignment_id, file_url, file_name, uploaded_by, uploaded_at)
          VALUES (@course_id, @assignment_id, @file_url, @file_name, @uploaded_by, @uploaded_at)
        `);
    }

    res.status(201).json({ id: assignmentId });
  } catch (err) {
    console.error("Error creating assignment with files:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT update an existing assignment with file upload and delete support
router.put('/:id', upload.array("files"), async (req, res) => {
  const { id } = req.params;
  const { course_id, title, description, due_date, uploaded_by } = req.body;

  
  let filesToDelete = req.body.filesToDelete || [];
if (!Array.isArray(filesToDelete)) {
  // If single string, convert to array with one element
  filesToDelete = [filesToDelete];
}


  if (!course_id || !title) {
    return res.status(400).json({ error: 'course_id and title are required' });
  }

  try {
    const pool = await sql.connect(config);

    // 1. Update assignment basic info
    const updateResult = await pool.request()
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

    if (updateResult.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Assignment not found or no changes were made' });
    }

    // 2. Delete files marked for deletion (remove from Azure Storage AND DB)
    for (const fileId of filesToDelete) {
      // Get file URL from DB
      const fileResult = await pool.request()
        .input('fileId', sql.Int, fileId) 
        .query('SELECT file_url FROM assignment_files WHERE id = @fileId');

      if (fileResult.recordset.length > 0) {
        const fileUrl = fileResult.recordset[0].file_url;    
        const url = new URL(fileUrl);
        const blobName = decodeURIComponent(url.pathname.split("/").pop());


        // Delete blob from Azure Storage
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.deleteIfExists();
        
        // Delete file record from DB
        await pool.request()
          .input('fileId', sql.Int, fileId)
          .query('DELETE FROM assignment_files WHERE id = @fileId');
      }
    }

    // 3. Upload new files (if any)
    const files = req.files;
    if (files && files.length > 0) {
      for (const file of files) {
        const blobName = `${Date.now()}-${file.originalname}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        await blockBlobClient.uploadData(file.buffer, {
          blobHTTPHeaders: { blobContentType: file.mimetype },
        });

        const fileUrl = blockBlobClient.url;

        await pool.request()
          .input("course_id", sql.Int, course_id)
          .input("assignment_id", sql.Int, id)
          .input("file_url", sql.NVarChar, fileUrl)
          .input("file_name", sql.NVarChar, file.originalname)
          .input("uploaded_by", sql.NVarChar, uploaded_by || "unknown")
          .input("uploaded_at", sql.DateTime, new Date())
          .query(`
            INSERT INTO assignment_files (course_id, assignment_id, file_url, file_name, uploaded_by, uploaded_at)
            VALUES (@course_id, @assignment_id, @file_url, @file_name, @uploaded_by, @uploaded_at)
          `);
      }
    }

    res.json({ message: "Assignment updated successfully" });
  } catch (err) {
    console.error("Error updating assignment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


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

// GET assignment files by assignment_id
router.get('/assignment_files', async (req, res) => {
  const assignment_id = req.query.assignment_id;

  if (!assignment_id) {
    return res.status(400).json({ error: 'Missing assignment_id query parameter' });
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('assignment_id', sql.Int, assignment_id)
      .query('SELECT * FROM assignment_files WHERE assignment_id = @assignment_id ORDER BY uploaded_at DESC');

    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching assignment files:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE a single assignment file by ID (alternative delete route)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await sql.connect(config);

    // 1. Delete related grades
    await pool.request()
      .input('assignmentId', sql.Int, id)
      .query('DELETE FROM Grades WHERE assignment_id = @assignmentId');

    // 2. Delete related submissions
    await pool.request()
      .input('assignmentId', sql.Int, id)
      .query('DELETE FROM assignment_submissions WHERE assignment_id = @assignmentId');

    // 3. Delete related comments
    await pool.request()
      .input('assignmentId', sql.Int, id)
      .query('DELETE FROM AssignmentComments WHERE assignment_id = @assignmentId');

    // 4. Delete related assignment files (from Azure Blob + DB)
    const filesResult = await pool.request()
      .input('assignmentId', sql.Int, id)
      .query('SELECT id, file_url FROM assignment_files WHERE assignment_id = @assignmentId');

    const files = filesResult.recordset;

    for (const file of files) {
      const blobName = decodeURIComponent(file.file_url.split('/').pop().split('?')[0]);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.deleteIfExists();

      await pool.request()
        .input('fileId', sql.Int, file.id)
        .query('DELETE FROM assignment_files WHERE id = @fileId');
    }

    // 5. Finally, delete the assignment itself
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Assignments WHERE id = @id');

    res.json({ message: 'Assignment and all related data deleted successfully' });

  } catch (err) {
    console.error('Error deleting assignment and related data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


export default router;
