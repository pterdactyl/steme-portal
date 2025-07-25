import express from 'express';
import sql from 'mssql';
import config from '../config/azureDb.js';
import { createCourseWithInitialVersion } from '../courseCreation/createCourses.js';

const router = express.Router();

// ------------------ COURSE MANAGEMENT ------------------ //

// Fetch all courses (optionally filter by teacherId and/or studentId)
router.get('/', async (req, res) => {
  const { teacherId, studentId } = req.query;
  try {
    const pool = await sql.connect(config);

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

    if (studentId) {
      query += ` INNER JOIN StudentCourses sc ON c.id = sc.course_id `;
    }

    const whereClauses = [];
    if (teacherId) whereClauses.push(`ct.teacher_id = @teacherId`);
    if (studentId) whereClauses.push(`sc.student_id = @studentId`);
    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    const request = pool.request();
    if (teacherId) request.input('teacherId', sql.Int, teacherId);
    if (studentId) request.input('studentId', sql.Int, studentId);

    const result = await request.query(query);

    const coursesMap = {};
    for (const row of result.recordset) {
      const { course_id, title, course_code, teacher_id, teacher_name } = row;
      if (!coursesMap[course_id]) {
        coursesMap[course_id] = {
          id: course_id,
          title,
          course_code,
          teachers: [],
        };
      }
      if (teacher_id && teacher_name) {
        if (!coursesMap[course_id].teachers.some(t => t.id === teacher_id)) {
          coursesMap[course_id].teachers.push({ id: teacher_id, name: teacher_name });
        }
      }
    }

    res.json(Object.values(coursesMap));
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ error: 'Server error fetching courses' });
  }
});

// Get all submissions (students) for a Course
router.get('/submissions/:courseId', async (req, res) => {
  const { courseId } = req.params;

  try {
    await sql.connect(config);

    const result = await sql.query`
      SELECT s.id, s.assignment_id, s.student_id, s.submitted_at
      FROM assignment_submissions s
      INNER JOIN Assignments a ON s.assignment_id = a.id
      WHERE a.course_id = ${courseId} 
    `;

    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching submissions:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new course
router.post('/create', async (req, res) => {
  const { title, courseCode, teacherIds } = req.body;
  if (!title || !courseCode || !Array.isArray(teacherIds)) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  try {
    const result = await createCourseWithInitialVersion(courseCode, title, teacherIds);
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating course:', err);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Update a course
router.put('/:id', async (req, res) => {
  const courseId = parseInt(req.params.id);
  const { title, courseCode, teacherIds } = req.body;

  if (!title || !courseCode || !Array.isArray(teacherIds)) {
    return res.status(400).json({ error: 'Invalid input' });
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

    res.json({ success: true, message: 'Course updated' });
  } catch (err) {
    console.error('Error updating course:', err);
    res.status(500).json({ error: 'Server error updating course' });
  }
});



// Fetch info from a Course including teachers and students
router.get('/:courseId', async (req, res) => {
  const courseId = parseInt(req.params.courseId);

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
    console.error('Error fetching course:', err);
    res.status(500).json({ error: 'Server error fetching course' });
  }
});

// ------------------ STUDENT COURSE SELECTION ------------------ //

router.post('/studentselections', async (req, res) => {
  const { id, grade, courses } = req.body;

  if (!id || !grade || !Array.isArray(courses)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  try {
    const pool = await sql.connect(config);

    await pool.request()
      .input('id', sql.Int, id)
      .input('grade', sql.NVarChar, grade)
      .query('DELETE FROM dbo.StudentCourseSelections WHERE student_id = @id AND Grade = @grade');

    for (const course of courses) {
      await pool.request()
        .input('id', sql.Int, id)
        .input('grade', sql.NVarChar, grade)
        .input('courseId', sql.NVarChar, course.id)
        .input('courseCode', sql.NVarChar, course.code)
        .input('courseTitle', sql.NVarChar, course.title)
        .input('credits', sql.Float, course.credits || 0)
        .query(`
          INSERT INTO dbo.StudentCourseSelections 
            (student_id, Grade, CourseId, CourseCode, CourseTitle, Credits)
          VALUES 
            (@id, @grade, @courseId, @courseCode, @courseTitle, @credits)
        `);
    }

    res.json({ message: 'Courses saved successfully.' });
  } catch (err) {
    console.error('Error saving student selections:', err);
    res.status(500).json({ error: 'Failed to save course selections.' });
  }
});

// Get list of students for a course
router.get('/:courseId/students', async (req, res) => {
  const courseId = parseInt(req.params.courseId);
  console.log(`Fetching students for courseId: ${courseId}`);

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
  .input('courseId', sql.Int, courseId)
  .query(`
    SELECT u.id, u.name AS fullName, u.email
    FROM dbo.Users u
    INNER JOIN dbo.StudentCourses sc ON u.id = sc.student_id
    WHERE sc.course_id = @courseId
    ORDER BY u.name
  `);

    console.log('Students fetched:', result.recordset.length);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching students for course:', err);  // <-- log the full error here
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});


export default router;
