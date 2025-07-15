import express from "express";
import sql from "mssql";
import config from "../config/azureDb.js";

const router = express.Router();

/**
 * @route GET /:courseId
 * @desc Fetch a course outline by courseId
 */
router.get("/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input("courseId", sql.VarChar, courseId)
      .query("SELECT * FROM CourseOutlines WHERE course_id = @courseId");

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Outline not found" });
    }

    const outline = result.recordset[0];
    outline.units = JSON.parse(outline.units || "[]");
    outline.final_assessments = JSON.parse(outline.final_assessments || "[]");

    res.json(outline);
  } catch (error) {
    console.error("Failed to fetch outline:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route POST /:courseId
 * @desc Add or update a course outline and store version history
 */
router.post("/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      course_name,
      grade,
      course_type,
      credit,
      description,
      learning_goals,
      assessment,
      units,
      final_assessments,
      total_hours,
      updated_by
    } = req.body;

    const pool = await sql.connect(config);

    // 1️⃣ Merge into main CourseOutlines table (Insert or Update)
    await pool.request()
      .input("course_id", sql.VarChar, courseId)
      .input("course_name", sql.VarChar, course_name)
      .input("grade", sql.VarChar, grade)
      .input("course_type", sql.VarChar, course_type)
      .input("credit", sql.VarChar, credit)
      .input("description", sql.Text, description)
      .input("learning_goals", sql.Text, learning_goals)
      .input("assessment", sql.Text, assessment)
      .input("units", sql.NVarChar, JSON.stringify(units))
      .input("final_assessments", sql.NVarChar, JSON.stringify(final_assessments))
      .input("total_hours", sql.Int, total_hours)
      .input("updated_by", sql.Int, updated_by)
      .query(`
        MERGE CourseOutlines AS target
        USING (SELECT @course_id AS course_id) AS source
        ON (target.course_id = source.course_id)
        WHEN MATCHED THEN
          UPDATE SET 
            course_name = @course_name,
            grade = @grade,
            course_type = @course_type,
            credit = @credit,
            description = @description,
            learning_goals = @learning_goals,
            assessment = @assessment,
            units = @units,
            final_assessments = @final_assessments,
            total_hours = @total_hours,
            updated_by = @updated_by,
            updated_at = GETDATE()
        WHEN NOT MATCHED THEN
          INSERT (
            course_id, course_name, grade, course_type, credit,
            description, learning_goals, assessment, units,
            final_assessments, total_hours, updated_by, updated_at
          ) VALUES (
            @course_id, @course_name, @grade, @course_type, @credit,
            @description, @learning_goals, @assessment, @units,
            @final_assessments, @total_hours, @updated_by, GETDATE()
          );
      `);

    // 2️⃣ Insert version into CourseOutlineVersions table
    await pool.request()
      .input("course_id", sql.VarChar, courseId)
      .input("version_number", sql.BigInt, Date.now()) // unique version number
      .input("course_name", sql.VarChar, course_name)
      .input("grade", sql.VarChar, grade)
      .input("course_type", sql.VarChar, course_type)
      .input("credit", sql.VarChar, credit)
      .input("description", sql.Text, description)
      .input("learning_goals", sql.Text, learning_goals)
      .input("assessment", sql.Text, assessment)
      .input("units", sql.NVarChar, JSON.stringify(units))
      .input("final_assessments", sql.NVarChar, JSON.stringify(final_assessments))
      .input("total_hours", sql.Int, total_hours)
      .input("updated_by", sql.Int, updated_by)
      .query(`
        INSERT INTO CourseOutlineVersions (
          course_id, version_number, course_name, grade, course_type, credit,
          description, learning_goals, assessment, units, final_assessments,
          total_hours, updated_by, updated_at
        ) VALUES (
          @course_id, @version_number, @course_name, @grade, @course_type, @credit,
          @description, @learning_goals, @assessment, @units, @final_assessments,
          @total_hours, @updated_by, GETDATE()
        )
      `);

    res.status(200).json({ message: "Outline saved successfully" });
  } catch (error) {
    console.error("Failed to save outline:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route GET /:courseId/history
 * @desc Fetch version history of a course outline
 */
router.get("/:courseId/history", async (req, res) => {
  const { courseId } = req.params;
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input("courseId", sql.VarChar, courseId)
      .query(`
        SELECT * FROM CourseOutlineVersions
        WHERE course_id = @courseId
        ORDER BY updated_at DESC
      `);

    const history = result.recordset.map((entry) => ({
      ...entry,
      units: JSON.parse(entry.units || "[]"),
      final_assessments: JSON.parse(entry.final_assessments || "[]"),
    }));

    res.json(history);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ message: "Failed to fetch outline history" });
  }
});

export default router;
