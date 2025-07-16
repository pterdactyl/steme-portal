import express from "express";
import sql from "mssql";
import config from "../config/azureDb.js";

const router = express.Router();

/**
 * @route GET /:courseCode
 * @desc Fetch a course outline by courseCode
 */
router.get("/:courseCode", async (req, res) => {
  try {
    const { courseCode } = req.params;
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input("courseCode", sql.VarChar, courseCode)
      .query("SELECT * FROM CourseOutlines WHERE course_code = @courseCode");

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
 * @route POST /:courseCode
 * @desc Add or update a course outline and store version history
 */
router.post("/:courseCode", async (req, res) => {
  try {
    const { courseCode } = req.params;
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
      updated_by,
    } = req.body;

    const pool = await sql.connect(config);

    // Merge into main CourseOutlines table using course_code
    await pool.request()
      .input("course_code", sql.VarChar, courseCode)
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
        USING (SELECT @course_code AS course_code) AS source
        ON (target.course_code = source.course_code)
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
            course_code, course_name, grade, course_type, credit,
            description, learning_goals, assessment, units,
            final_assessments, total_hours, updated_by, updated_at
          ) VALUES (
            @course_code, @course_name, @grade, @course_type, @credit,
            @description, @learning_goals, @assessment, @units,
            @final_assessments, @total_hours, @updated_by, GETDATE()
          );
      `);

    // Insert version into CourseOutlineVersions table
    await pool.request()
      .input("course_code", sql.VarChar, courseCode)
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
          course_code, version_number, course_name, grade, course_type, credit,
          description, learning_goals, assessment, units, final_assessments,
          total_hours, updated_by, updated_at
        ) VALUES (
          @course_code, @version_number, @course_name, @grade, @course_type, @credit,
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
 * @route GET /:courseCode/draft
 * @desc Get a specific teacher's course outline draft
 * @query teacherId - Required teacher's user id to filter drafts
 */
router.get("/:courseCode/draft", async (req, res) => {
  const { courseCode } = req.params;
  const { teacherId } = req.query;

  if (!teacherId) {
    return res.status(400).json({ message: "Missing teacherId" });
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input("courseCode", sql.VarChar, courseCode)
      .input("teacherId", sql.Int, teacherId)
      .query(`
        SELECT * FROM CourseOutlineDrafts
        WHERE course_code = @courseCode AND updated_by = @teacherId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Draft not found" });
    }

    const draft = result.recordset[0];
    draft.units = JSON.parse(draft.units || "[]");
    draft.final_assessments = JSON.parse(draft.final_assessments || "[]");

    res.json(draft);
  } catch (error) {
    console.error("Error fetching draft:", error);
    res.status(500).json({ message: "Failed to fetch draft" });
  }
});

/**
 * @route POST /:courseCode/draft
 * @desc Save or update a draft of a course outline
 */
router.post("/:courseCode/draft", async (req, res) => {
  try {
    const { courseCode } = req.params;
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
      updated_by,
    } = req.body;

    const pool = await sql.connect(config);

    await pool.request()
      .input("course_code", sql.VarChar, courseCode)
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
        UPDATE CourseOutlineDrafts
        SET 
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
          updated_at = GETDATE()
        WHERE course_code = @course_code AND updated_by = @updated_by;

        IF @@ROWCOUNT = 0
        BEGIN
          INSERT INTO CourseOutlineDrafts (
            course_code, course_name, grade, course_type, credit,
            description, learning_goals, assessment, units,
            final_assessments, total_hours, updated_by
          ) VALUES (
            @course_code, @course_name, @grade, @course_type, @credit,
            @description, @learning_goals, @assessment, @units,
            @final_assessments, @total_hours, @updated_by
          );
        END
      `);

    res.status(200).json({ message: "Draft saved successfully" });
  } catch (error) {
    console.error("Failed to save draft:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route GET /:courseCode/history
 * @desc Fetch version history of a course outline by courseCode
 */
router.get("/:courseCode/history", async (req, res) => {
  try {
    const { courseCode } = req.params;
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input("courseCode", sql.VarChar, courseCode)
      .query(`
        SELECT * FROM CourseOutlineVersions
        WHERE course_code = @courseCode
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
