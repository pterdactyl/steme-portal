import express from 'express';
import { createCourseWithInitialVersion } from '../courseCreation/createCourses.js';
import config from "../config/azureDb.js";
import sql from 'mssql';

const router = express.Router();

// Fetch All Courses (Can filter by TeacherID and/or StudentID)
router.get('/', async (req, res) => {
  const { teacherId, studentId } = req.query;
  const pool = await sql.connect(config);

  // Base query with joins for teachers and students
  let query = `
    SELECT 
      c.id AS course_id,
      c.title,
      c.course_code,
      u.id AS teacher_id,
      u.name AS teacher_name
    FROM Courses c
    LEFT JOIN CourseTeachers ct ON c.id = ct.course_id
    LEFT JOIN Users u ON ct.teacher_id = u.id
  `;

  // Join student table if filtering by studentId
  if (studentId) {
    query += `
      INNER JOIN StudentCourses sc ON c.id = sc.course_id
    `;
  }

  // Build WHERE conditions
  const whereConditions = [];
  if (teacherId) {
    whereConditions.push(`ct.teacher_id = @teacherId`);
  }
  if (studentId) {
    whereConditions.push(`sc.student_id = @studentId`);
  }
  if (whereConditions.length > 0) {
    query += ' WHERE ' + whereConditions.join(' AND ');
  }

  const request = pool.request();
  if (teacherId) {
    request.input('teacherId', sql.Int, teacherId);
  }
  if (studentId) {
    request.input('studentId', sql.Int, studentId);
  }

  const result = await request.query(query);

  // Group by course and collect teachers
  const coursesMap = {};
  for (const row of result.recordset) {
    const { course_id, title, course_code, teacher_id, teacher_name } = row;

    if (!coursesMap[course_id]) {
      coursesMap[course_id] = {
        id: course_id,
        title,
        course_code,
        teachers: []
      };
    }

    if (teacher_id && teacher_name) {
      // Avoid duplicate teachers for a course
      const exists = coursesMap[course_id].teachers.some(t => t.id === teacher_id);
      if (!exists) {
        coursesMap[course_id].teachers.push({ id: teacher_id, name: teacher_name });
      }
    }
  }

  res.json(Object.values(coursesMap));
});


// Create a course
router.post('/create', async (req, res) => {
  const { title, courseCode, teacherIds } = req.body;

  try {
    const result = await createCourseWithInitialVersion(courseCode, title, teacherIds);
    res.status(201).json(result);
    console.log("try");
  } catch (error) {
    console.log("error");
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to create course' });
  }
});

// Update a Course

router.put('/:id', async (req, res) => {
  const courseId = parseInt(req.params.id);
  const { title, courseCode, teacherIds } = req.body;
  console.log('PUT /api/courses/:id body:', req.body);
  if (!title || !courseCode || !Array.isArray(teacherIds)) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  try {
    const pool = await sql.connect(config);

    await pool.request()
      .input('id', sql.Int, courseId)
      .input('title', sql.NVarChar, title)
      .input('courseCode', sql.NVarChar, courseCode)
      .query('UPDATE Courses SET title = @title, course_code = @courseCode WHERE id = @id');

    await pool.request()
      .input('courseId', sql.Int, courseId)
      .query('DELETE FROM CourseTeachers WHERE course_id = @courseId');

    for (const teacherId of teacherIds) {
      await pool.request()
        .input('courseId', sql.Int, courseId)
        .input('teacherId', sql.Int, teacherId)
        .query('INSERT INTO CourseTeachers (course_id, teacher_id) VALUES (@courseId, @teacherId)');
    }

    res.status(200).json({ success: true, message: 'Course updated' });
  } catch (err) {
    console.error('Error updating course:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Fetch info from a Course including teachers and students
router.get('/:courseId', async (req, res) => {
  const { courseId } = req.params;

  try {
    const pool = await sql.connect(config);

    // 1. Get course + teacher(s)
    const courseResult = await pool.request()
      .input('courseId', sql.Int, courseId)
      .query(`
        SELECT 
          c.id AS course_id,
          c.title,
          c.course_code,
          u.id AS teacher_id,
          u.name AS teacher_name
        FROM Courses c
        LEFT JOIN CourseTeachers ct ON c.id = ct.course_id
        LEFT JOIN Users u ON ct.teacher_id = u.id
        WHERE c.id = @courseId
      `);

    if (courseResult.recordset.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Extract and group teachers
    const { course_id, title, course_code } = courseResult.recordset[0];
    const teachers = courseResult.recordset
      .filter(r => r.teacher_id)
      .map(r => ({ id: r.teacher_id, name: r.teacher_name }));

    // 2. Get students in the course
    const studentResult = await pool.request()
      .input('courseId', sql.Int, courseId)
      .query(`
        SELECT u.id, u.name, u.email
        FROM StudentCourses cs
        JOIN Users u ON cs.student_id = u.id
        WHERE cs.course_id = @courseId
      `);

    const students = studentResult.recordset;

    // 3. Send full course info
    res.json({
      id: course_id,
      title,
      course_code,
      teachers,
      students,
    });

  } catch (err) {
    console.error("Error fetching course by ID:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;