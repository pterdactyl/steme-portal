// scripts/importCoursesFromCSV.js

import fs from 'fs';
import csv from 'csv-parser';
import sql from 'mssql';
import config from './config/azureDb.js'; // your SQL connection config
async function importCourses() {
    const pool = await sql.connect(config); // connect once outside loop
  
    const results = [];
    fs.createReadStream("course-outlines.csv")
    .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
      .on("data", (data) => {
        
        results.push(data);
      })
      .on("end", async () => {
        for (const row of results) {
          const {
            course_name, grade, course_type, credit, description,
            learning_goals, assessment, units, final_assessments,
            total_hours, course_code, specific_expectations
          } = row;

          let raw = row.prerequisite?.trim();
let prerequisite = "";

if (raw && raw.toLowerCase() !== "none") {
  prerequisite = raw.replace(/\s+or\s+/gi, ", ").trim();
}
          console.log("Here: {row}", row);
          const newTitle = `Grade ${grade} ${course_name.trim()}`;
  
          try {
            // Update title and prerequisites in Courses table
            await pool.request()
              .input("course_code", sql.VarChar, course_code)
              .input("title", sql.VarChar, newTitle)
            
              .query(`
                UPDATE Courses
                SET title = @title
                WHERE course_code = @course_code;
              `);
  
            // Get course_id
            const courseResult = await pool.request()
              .input("course_code", sql.VarChar, course_code)
              .query(`SELECT id FROM Courses WHERE course_code = @course_code`);
  
            if (courseResult.recordset.length === 0) {
              console.warn(`Course not found: ${course_code}`);
              continue;
            }
  
            const courseId = courseResult.recordset[0].id;
  
            // Update latest CourseOutlineVersion
            const versionResult = await pool.request()
              .input("course_id", sql.Int, courseId)
              .query(`
                SELECT TOP 1 id FROM CourseOutlineVersions
                WHERE course_id = @course_id
                ORDER BY version_number DESC;
              `);
  
            if (versionResult.recordset.length === 0) {
              console.warn(`No outline versions for course: ${course_code}`);
              continue;
            }
  
            const versionId = versionResult.recordset[0].id;
  
            

              await pool.request()
              .input("id", sql.Int, versionId)
              .input("course_name", sql.VarChar, newTitle)
              .input("prerequisites", sql.Text, prerequisite || "")
              .input("course_id", sql.Int, courseId)
              .query(`
                UPDATE CourseOutlines
                SET course_name = @course_name,
                    prerequisite = @prerequisites,
                    updated_at = GETDATE()
                WHERE course_id = @course_id;
              `);
  
            console.log(`Updated: ${course_code} - ${newTitle}`);
          } catch (err) {
            console.error(`Error updating ${course_code}`, err);
          }
        }
  
        await pool.close();
        console.log("Done importing all courses.");
      });
  }

importCourses();