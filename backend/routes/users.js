import express from "express";
import sql from 'mssql';
const router = express.Router();

import config from "../config/azureDb.js"; // You can update this based on your connection config

// Add user to the DB
// Add user or return existing user with role and id
router.post("/", async (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: "Missing email or name" });
  }

  try {
    const pool = await sql.connect(config);

    // Check if user already exists
    const existingUserResult = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT id, role FROM Users WHERE email = @email");

    if (existingUserResult.recordset.length > 0) {
      const user = existingUserResult.recordset[0];
      return res.status(200).json({ 
        message: "User already exists", 
        id: user.id, 
        role: user.role 
      });
    }

    // Insert new user with default role = 'student'
    await pool
      .request()
      .input("email", sql.VarChar, email)
      .input("name", sql.VarChar, name)
      .input("role", sql.VarChar, "student")
      .query("INSERT INTO Users (email, name, role) VALUES (@email, @name, @role)");

    // Fetch and return the new user's id and role
    const newUserResult = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT id, role FROM Users WHERE email = @email");

    const newUser = newUserResult.recordset[0];

    res.status(201).json({
      message: "User added successfully",
      id: newUser.id,
      role: newUser.role
    });

  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Server error" });
  }
});







//Get a user's role

router.get("/get-role", async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email required" });

  try {
    const pool = await sql.connect(config);

    const result = await pool
      .request()
      .input("email", sql.VarChar, email)

      .query("SELECT role FROM Users WHERE email = @email");

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ role: result.recordset[0].role });
  } catch (err) {
    console.error("Error fetching role:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get teachers

router.get('/teachers', async (req, res) => {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .query("SELECT id, name FROM users WHERE role = 'teacher'");
    res.json(result.recordset);
  });


  // Update Teacher Courses
router.put('/teachers/:id/courses', async (req, res) => {
    const teacherId = parseInt(req.params.id);
    const { courseIds } = req.body;
  
    if (!Array.isArray(courseIds)) {
      return res.status(400).json({ error: 'courseIds must be an array' });
    }
  
    try {
      const pool = await sql.connect(config);
  
      // Delete all current course assignments for this teacher
      await pool.request()
        .input('teacherId', sql.Int, teacherId)
        .query('DELETE FROM CourseTeachers WHERE teacher_id = @teacherId');
  
      // Insert new course assignments
      for (const courseId of courseIds) {
        await pool.request()
          .input('teacherId', sql.Int, teacherId)
          .input('courseId', sql.Int, courseId)
          .query('INSERT INTO CourseTeachers (teacher_id, course_id) VALUES (@teacherId, @courseId)');
      }
  
      res.status(200).json({ success: true, message: 'Courses updated for teacher' });
    } catch (err) {
      console.error('Error updating courses:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Fetch all Students
  router.get('/students', async (req, res) => {
    try {
      const pool = await sql.connect(config);
  
      // Get all students with role = 'student'
      // Join to get courses each student is enrolled in via StudentCourses table
      const result = await pool.request().query(`
        SELECT 
          u.id AS student_id,
          u.name,
          u.email,
          sc.course_id
        FROM users u
        LEFT JOIN StudentCourses sc ON u.id = sc.student_id
        WHERE u.role = 'student'
        ORDER BY u.name
      `);
  
      // Group courses by student
      const studentsMap = {};
      for (const row of result.recordset) {
        const { student_id, name, email, course_id } = row;
        if (!studentsMap[student_id]) {
          studentsMap[student_id] = {
            id: student_id,
            name,
            email,
            courseIds: []
          };
        }
        if (course_id !== null) {
          studentsMap[student_id].courseIds.push(course_id);
        }
      }
  
      const students = Object.values(studentsMap);
      res.json(students);
    } catch (err) {
      console.error('Error fetching students:', err);
      res.status(500).json({ message: 'Server error fetching students' });
    }
  });
  
  // Update Student Courses

  router.put('/students/:id/courses', async (req, res) => {
    const studentId = parseInt(req.params.id);
    const { courseIds } = req.body;
  
    if (!Array.isArray(courseIds)) {
      return res.status(400).json({ error: 'courseIds must be an array' });
    }
  
    try {
      const pool = await sql.connect(config);
  
      // Delete all current course assignments for this student
      await pool.request()
        .input('studentId', sql.Int, studentId)
        .query('DELETE FROM StudentCourses WHERE student_id = @studentId');
  
      // Insert new course assignments
      for (const courseId of courseIds) {
        await pool.request()
          .input('studentId', sql.Int, studentId)
          .input('courseId', sql.Int, courseId)
          .query('INSERT INTO StudentCourses (student_id, course_id) VALUES (@studentId, @courseId)');
      }
  
      res.status(200).json({ success: true, message: 'Courses updated for student' });
    } catch (err) {
      console.error('Error updating courses:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

export default router;