import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import courseRoutes from './routes/courseRoutes.js';

import assignmentsRoutes from './routes/assignmentsRoutes.js';
import usersRoute from './routes/users.js';
import outlinesRoute from './routes/outlines.js';
import attendanceRoutes from './routes/attendance.js'

import viewOutlineRoutes from './routes/viewOutlineRoutes.js';
import announcementsRouter from './routes/announcements.js';
import gradesRoutes from './routes/grades.js'
import submissionRoutes from './routes/submissions.js'
import studentAssignments from './routes/studentAssignments.js';
import assignmentFilesRoutes from './routes/assignmentFiles.js';
import commentRoutes from "./routes/comments.js";
import studentRoutes from "./routes/students.js";


dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

const corsOptions = {
  origin: ['http://localhost:3000', 'https://brave-mud-02ebf860f.1.azurestaticapps.net'],  // your React app
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true, // allow cookies / headers
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/courses', courseRoutes); 
app.use('/api/assignments', assignmentsRoutes);
app.use("/api/users", usersRoute);
app.use("/api/outlines", outlinesRoute);
app.use('/api/attendance', attendanceRoutes);
app.use("/api/view-outline", viewOutlineRoutes);
app.use('/api/courses', announcementsRouter);

app.use("/api/attendance", attendanceRoutes);
app.use("/api/grades", gradesRoutes);
app.use("/api/submissions", submissionRoutes);
app.use('/api/student-assignments', studentAssignments);
app.use('/api/assignment-files', assignmentFilesRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/comments", commentRoutes);
app.use("/api/students", studentRoutes);


app.get('/', (req, res) => {
  res.send('API is working!');
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});

