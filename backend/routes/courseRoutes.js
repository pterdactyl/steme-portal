import express from 'express';
import { createCourseWithInitialVersion } from '../courseCreation/createCourses.js';
import config from "../config/azureDb.js";
import sql from 'mssql';

const router = express.Router();

// Fetch Courses
router.get('/', async (req, res) => {
  const pool = await sql.connect(config);

  const result = await pool.request().query(`
    SELECT 
      c.id AS course_id,
      c.title,
      c.course_code,
      u.id AS teacher_id,
      u.name AS teacher_name
    FROM Courses c
    LEFT JOIN CourseTeachers ct ON c.id = ct.course_id
    LEFT JOIN Users u ON ct.teacher_id = u.id
  `);

  // Group by course
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
      coursesMap[course_id].teachers.push({ id: teacher_id, name: teacher_name });
    }
  }

  const courses = Object.values(coursesMap);
  res.json(courses);
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

export default router;