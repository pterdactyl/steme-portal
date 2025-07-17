import express from 'express';
import sql from 'mssql';
import config from '../config/azureDb.js';

const router = express.Router();

// POST: Create a new announcement and return it
router.post("/:courseId/announcements", async (req, res) => {
  const { courseId } = req.params;
  const { message, author } = req.body;

  const courseIdInt = parseInt(courseId, 10);
  if (isNaN(courseIdInt)) {
    return res.status(400).json({ error: "Invalid courseId" });
  }

  if (!message || !author) {
    return res.status(400).json({ error: "Message and author are required." });
  }

  try {
    const pool = await sql.connect(config);

    const result = await pool.request()
      .input("courseId", sql.Int, courseIdInt)
      .input("message", sql.NVarChar(sql.MAX), message)
      .input("author", sql.NVarChar(100), author)
      .query(`
        INSERT INTO Announcements (course_id, message, author, created_at)
        OUTPUT inserted.*
        VALUES (@courseId, @message, @author, GETDATE())
      `);

    const inserted = result.recordset[0];
    res.status(201).json(inserted);
  } catch (err) {
    console.error("Error posting announcement:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET: Fetch all announcements for a course
router.get("/:courseId/announcements", async (req, res) => {
  const { courseId } = req.params;

  const courseIdInt = parseInt(courseId, 10);
  if (isNaN(courseIdInt)) {
    return res.status(400).json({ error: "Invalid courseId" });
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input("courseId", sql.Int, courseIdInt)
      .query(`
        SELECT * FROM Announcements
        WHERE course_id = @courseId
        ORDER BY created_at DESC
      `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error fetching announcements:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update announcement
router.put("/:courseId/announcements/:id", async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  try {
    const pool = await sql.connect(config);

    await pool.request()
      .input("id", sql.Int, id)
      .input("message", sql.NVarChar(sql.MAX), message)
      .query("UPDATE Announcements SET message = @message WHERE announcement_id = @id");

    res.json({ success: true });
  } catch (err) {
    console.error("Error updating announcement:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete announcement
router.delete("/:courseId/announcements/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await sql.connect(config);

    await pool.request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Announcements WHERE announcement_id = @id");

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting announcement:", err);
    res.status(500).json({ error: "Server error" });
  }
});


export default router;
