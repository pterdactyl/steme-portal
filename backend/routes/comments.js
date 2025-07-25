import express from "express";
import sql from "mssql";
import config from "../config/azureDb.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { assignment_id, sender_id, message } = req.body;

  if (!assignment_id || !sender_id || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input("assignment_id", sql.Int, assignment_id)
      .input("sender_id", sql.Int, sender_id)
      .input("message", sql.NVarChar, message)
      .input("student_id", sql.Int, sender_id)
      .query(`
        INSERT INTO AssignmentComments (assignment_id, sender_id, message, student_id)
        VALUES (@assignment_id, @sender_id, @message, @student_id)
      `);

    res.status(201).json({ message: "Comment added successfully" });
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:assignmentId", async (req, res) => {
  const { assignmentId } = req.params;

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input("assignment_id", sql.Int, assignmentId)
      .query(`
        SELECT ac.*, u.name AS sender_name
        FROM AssignmentComments ac
        JOIN Users u ON ac.sender_id = u.id
        WHERE assignment_id = @assignment_id
        ORDER BY timestamp ASC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Fetch comments error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
