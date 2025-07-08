import sql from 'mssql';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/azureConfig.js'

async function createCourseWithInitialVersion(courseCode, title, teacherIds) {
  console.log("Creating course with:", { courseCode, title, teacherIds });
  const courseId = uuidv4();
  const pool = await sql.connect(config);

  try {
    await pool.request()

      .input('title', sql.NVarChar, title)
      .input('code', sql.NVarChar, courseCode)
      .query('INSERT INTO Courses (title, code) VALUES (@title, @code)');
    
    // for (const teacherId of teacherIds) {
    //   await pool.request()
    //     .input('course_id', sql.UniqueIdentifier, courseId)
    //     .input('teacher_id', sql.NVarChar, teacherId)
    //     .query(`INSERT INTO CourseTeachers (course_id, teacher_id) VALUES (@course_id, @teacher_id)`);    
    //   }
    console.log(`Course ${courseId} created in Azure SQL`);
  } 
  catch (err) {
    console.error('Azure SQL error:', err);
  }
}

export { createCourseWithInitialVersion };
