import express from "express";
import sql from "mssql";

const router = express.Router();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: { encrypt: true, trustServerCertificate: false },
};

// Utility: Convert DB row to camelCase object
const formatOutline = (row) => ({
  courseId: row.course_id,
  courseCode: row.course_code,
  courseName: row.course_name,
  grade: row.grade,
  courseType: row.course_type,
  credit: row.credit,
  description: row.description,
  learningGoals: row.learning_goals,
  assessment: row.assessment,
  units: row.units ? JSON.parse(row.units) : [],
  finalAssessments: row.final_assessments ? JSON.parse(row.final_assessments) : [],
  totalHours: row.total_hours,
  updatedBy: row.updated_by,
  updatedAt: row.updated_at,
});

router.get("/:courseCode", async (req, res) => {
  const { courseCode } = req.params;

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      // Specify length 20 for courseCode to avoid truncation
      .input("courseCode", sql.VarChar(20), courseCode.trim())
      .query("SELECT * FROM dbo.CourseOutlines WHERE course_code = @courseCode");

    console.log("DB query result:", result.recordset);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Course outline not found" });
    }

    const formattedOutline = formatOutline(result.recordset[0]);
    res.json(formattedOutline);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
