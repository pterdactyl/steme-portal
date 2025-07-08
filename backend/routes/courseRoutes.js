import express from 'express';
import { createCourseWithInitialVersion } from '../courseCreation/createCourses.js';

const router = express.Router();

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

export default router;