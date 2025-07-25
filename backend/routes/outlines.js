import express from "express";
import sql from "mssql";
import config from "../config/azureDb.js";

const router = express.Router();

// Fetching a Course Outline
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

  // Publishing a Course Outline (updates the CourseOutline and CourseOutlineVersions table)
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
        updated_by,
        course_code,
        prerequisite,
      } = req.body;
  
      const pool = await sql.connect(config);
  
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
        .input("course_code", sql.VarChar, course_code)
        .input("prerequisite", sql.Text, prerequisite)
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
              updated_at = GETDATE(),
              course_code = @course_code,
              prerequisite = @prerequisite
          WHEN NOT MATCHED THEN
            INSERT (
              course_id, course_name, grade, course_type, credit,
              description, learning_goals, assessment, units,
              final_assessments, total_hours, updated_by, updated_at, course_code, prerequisite
            ) VALUES (
              @course_id, @course_name, @grade, @course_type, @credit,
              @description, @learning_goals, @assessment, @units,
              @final_assessments, @total_hours, @updated_by, GETDATE(), @course_code, @prerequisite
            );
        `);
        const versionResult = await pool.request()
            .input("course_id", sql.VarChar, courseId)
            .query(`SELECT ISNULL(MAX(version_number), 0) + 1 AS next_version FROM CourseOutlineVersions WHERE course_id = @course_id`);

        const version_number = versionResult.recordset[0].next_version;

        await pool.request()
        .input("course_id", sql.VarChar, courseId)
        .input("version_number", sql.Int, version_number)
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
        .input("course_code", sql.VarChar, course_code)
        .input("prerequisite", sql.Text, prerequisite)
        .query(`
          INSERT INTO CourseOutlineVersions (
            course_id, version_number, course_name, grade, course_type, credit,
            description, learning_goals, assessment, units, final_assessments,
            total_hours, updated_by, course_code, prerequisite
          ) VALUES (
            @course_id, @version_number, @course_name, @grade, @course_type, @credit,
            @description, @learning_goals, @assessment, @units, @final_assessments,
            @total_hours, @updated_by, @course_code, @prerequisite
          )
        `);

  
      res.status(200).json({ message: "Outline saved successfully" });
    } catch (error) {
      console.error("Failed to save outline:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Post a draft of a course outline to the CourseOutlineDrafts table
  router.post("/:courseId/draft", async (req, res) => {
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
          updated_by,
          course_code,
          prerequisite,
        } = req.body;
    
        const pool = await sql.connect(config);
    
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
        .input("course_code", sql.VarChar, course_code)
        .input("prerequisite", sql.Text, prerequisite)
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
            updated_at = GETDATE(),
            course_code = @course_code,
            prerequisite = @prerequisite
            WHERE course_id = @course_id AND updated_by = @updated_by;

            IF @@ROWCOUNT = 0
            BEGIN
            INSERT INTO CourseOutlineDrafts (
                course_id, course_name, grade, course_type, credit,
                description, learning_goals, assessment, units,
                final_assessments, total_hours, updated_by, course_code, prerequisite
            ) VALUES (
                @course_id, @course_name, @grade, @course_type, @credit,
                @description, @learning_goals, @assessment, @units,
                @final_assessments, @total_hours, @updated_by, @course_code, @prerequisite
            );
            END
        `);
  
    
        res.status(200).json({ message: "Outline saved successfully" });
      } catch (error) {
        console.error("Failed to save outline:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

  // Get a specific teacher's course outline draft
router.get("/:courseId/draft", async (req, res) => {
    const { courseId } = req.params;
    const { teacherId } = req.query;
  
    if (!teacherId) {
      return res.status(400).json({ message: "Missing teacherId" });
    }
  
    try {
      const pool = await sql.connect(config);
      const result = await pool.request()
        .input("courseId", sql.VarChar, courseId)
        .input("teacherId", sql.Int, teacherId)
        .query(`
          SELECT * FROM CourseOutlineDrafts
          WHERE course_id = @courseId AND updated_by = @teacherId
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

  // Get Version History
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




  // Get outline by course code
  router.get("/by-course-code/:courseCode", async (req, res) => {
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
      console.error("Failed to fetch outline by course_code:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
export default router;