import sql from 'mssql';
import config from '../config/azureDb.js';

async function createCourseWithInitialVersion(courseCode, title, teacherIds) {
  console.log("Creating course with:", { courseCode, title, teacherIds });
  const pool = await sql.connect(config);

  try {
    // Insert the course and get the new course's ID (INT)
    const result = await pool.request()
      .input('title', sql.NVarChar, title)
      .input('course_code', sql.NVarChar, courseCode)
      .query(`
        INSERT INTO Courses (title, course_code)
        OUTPUT INSERTED.id
        VALUES (@title, @course_code)
      `);

    const courseId = result.recordset[0].id;

    // Insert teacher links into CourseTeachers
    for (const teacherId of teacherIds) {
      await pool.request()
        .input('course_id', sql.Int, courseId)
        .input('teacher_id', sql.Int, teacherId)
        .query(`
          INSERT INTO CourseTeachers (course_id, teacher_id)
          VALUES (@course_id, @teacher_id)
        `);
    }

    console.log(`✅ Course ${courseId} created with ${teacherIds.length} teacher(s).`);
    return { success: true, courseId };
  } catch (err) {
    console.error('❌ Azure SQL error:', err);
    return { success: false, error: err.message };
  }
}

export { createCourseWithInitialVersion };