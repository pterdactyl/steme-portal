import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";

import StudentAnnouncements from "./StudentAnnouncements";
import StudentAssignments from "./StudentAssignments";
import StudentGrades from "./StudentGrades";
import StudentClasslist from "./StudentClasslist";
import StudentCourseOutline from "./StudentCourseOutline";

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function StudentCourse({ user }) {
  const { courseId } = useParams();
  const [tab, setTab] = useState(0);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleChange = (event, newValue) => setTab(newValue);

  useEffect(() => {
    async function fetchCourseData() {
      try {
        const res = await fetch(`http://localhost:4000/api/courses/${courseId}`);
        if (!res.ok) throw new Error("Failed to fetch course info");
        const data = await res.json();
        setCourseData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCourseData();
  }, [courseId]);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!courseData) {
    return <Typography color="error">Could not load course data.</Typography>;
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        {courseData.course_code}
      </Typography>

      <Tabs
        value={tab}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Announcements" />
        <Tab label="Assignments" />
        <Tab label="Grades / Feedback" />
        <Tab label="Classlist" />
        <Tab label="Course Outline" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <StudentAnnouncements courseId={courseId} />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <StudentAssignments user={user} courseId={courseId} />
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <StudentGrades user={user} courseId={courseId} />
      </TabPanel>
      <TabPanel value={tab} index={3}>
        <StudentClasslist courseId={courseId} />
      </TabPanel>
      <TabPanel value={tab} index={4}>
        <StudentCourseOutline courseCode={courseData.course_code} />
      </TabPanel>
    </Paper>
  );
}
