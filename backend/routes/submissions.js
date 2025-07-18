import express from "express";
import sql from 'mssql';
const router = express.Router();

import config from "../config/azureDb.js";

// Get a student's submissions for an assignment
router.get("/:assignmentId/:studentId", async (req, res) => {
    const { assignmentId, studentId } = req.params;
  
    try {
      const pool = await sql.connect(config);
  
      // Get submission data
      const submissionResult = await pool.request()
        .input("assignmentId", sql.Int, assignmentId)
        .input("studentId", sql.Int, studentId)
        .query(`
          SELECT * FROM Submissions
          WHERE assignment_id = @assignmentId AND student_id = @studentId
        `);
  
      if (submissionResult.recordset.length === 0) {
        return res.status(404).json({ message: "Submission not found" });
      }
  
      const submission = submissionResult.recordset[0];
  
      // Get student details
      const studentResult = await pool.request()
        .input("studentId", sql.Int, studentId)
        .query(`SELECT id, name FROM Users WHERE id = @studentId`);
  
      const student = studentResult.recordset[0] || null;
  
      res.json({ submission, student });
    } catch (error) {
      console.error("Failed to fetch submission:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

export default router;