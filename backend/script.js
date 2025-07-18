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
  
          console.log("Here: {row}", row);
  
          try {
            // Insert into Courses (new id each time)
            const insertCourse = await pool
              .request()
              .input("course_code", sql.VarChar, course_code)
              .input("title", sql.VarChar, course_name)
              .query(`
                INSERT INTO Courses (course_code, title, created_at)
                OUTPUT INSERTED.id
                VALUES (@course_code, @title, GETDATE());
              `);
  
            const courseId = insertCourse.recordset[0].id;
  
            // Insert into CourseOutlines
            await pool.request()
              .input("course_id", sql.Int, courseId)
              .input("course_name", sql.VarChar, course_name.trim())
              .input("grade", sql.Int, grade)
              .input("course_type", sql.VarChar, course_type)
              .input("credit", sql.Decimal(3, 1), credit)
              .input("description", sql.Text, description)
              .input("learning_goals", sql.Text, learning_goals)
              .input("assessment", sql.Text, assessment)
              .input("units", sql.Text, units)
              .input("final_assessments", sql.Text, final_assessments)
              .input("total_hours", sql.Int, total_hours)
              .input("updated_by", sql.Int, 2)
              .input("course_code", sql.VarChar, course_code)
              .input("specific_expectations", sql.Text, specific_expectations)
              .query(`
                INSERT INTO CourseOutlines (
                  course_id, course_name, grade, course_type, credit, description,
                  learning_goals, assessment, units, final_assessments, total_hours,
                  updated_by, updated_at, course_code, specific_expectations
                )
                VALUES (
                  @course_id, @course_name, @grade, @course_type, @credit, @description,
                  @learning_goals, @assessment, @units, @final_assessments, @total_hours,
                  @updated_by, GETDATE(), @course_code, @specific_expectations
                );
              `);
  
            // Insert into CourseOutlineVersions (version 1)
            await pool.request()
              .input("course_id", sql.Int, courseId)
              .input("version_number", sql.Int, 1)
              .input("course_name", sql.VarChar, course_name.trim())
              .input("grade", sql.Int, grade)
              .input("course_type", sql.VarChar, course_type)
              .input("credit", sql.Decimal(3, 1), credit)
              .input("description", sql.Text, description)
              .input("learning_goals", sql.Text, learning_goals)
              .input("assessment", sql.Text, assessment)
              .input("units", sql.Text, units)
              .input("final_assessments", sql.Text, final_assessments)
              .input("total_hours", sql.Int, total_hours)
              .input("updated_by", sql.Int, 2)
              .input("course_code", sql.VarChar, course_code)
              .input("specific_expectations", sql.Text, specific_expectations)
              .query(`
                INSERT INTO CourseOutlineVersions (
                  course_id, version_number, course_name, grade, course_type, credit, description,
                  learning_goals, assessment, units, final_assessments, total_hours,
                  updated_by, updated_at, course_code, specific_expectations
                )
                VALUES (
                  @course_id, @version_number, @course_name, @grade, @course_type, @credit,
                  @description, @learning_goals, @assessment, @units, @final_assessments,
                  @total_hours, @updated_by, GETDATE(), @course_code, @specific_expectations
                );
              `);
  
            console.log(`Inserted ${course_code} - ${course_name.trim()}`);
          } catch (err) {
            console.error(`Error inserting course ${course_code}`, err);
          }
        }
  
        await pool.close();
        console.log("Done importing all courses.");
      });
  }

importCourses();