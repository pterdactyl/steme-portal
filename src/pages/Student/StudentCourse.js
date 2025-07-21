import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  Campaign,
  Assignment,
  Grade,
  People,
  MenuBook,
} from "@mui/icons-material";

import StudentAnnouncements from "./StudentAnnouncements";
import StudentAssignments from "./StudentAssignments";
import StudentGrades from "./StudentGrades";
import StudentClasslist from "./StudentClasslist";
import StudentCourseOutline from "./StudentCourseOutline";

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index} style={{ width: "100%" }}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function StudentCourse({ user }) {
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const initialTab = parseInt(searchParams.get("tab")) || 0;
  const [tab, setTab] = useState(initialTab);
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
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!courseData) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography color="error">Could not load course data.</Typography>
      </Box>
    );
  }

  return (
    <Paper
      elevation={4}
      sx={{
        p: 0,
        borderRadius: 4,
        overflow: "hidden",
        maxWidth: 1100,
        mx: "auto",
        mt: 4,
      }}
    >
      {/* Fancy Gradient Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #2196f3, #21cbf3)",
          color: "white",
          p: 3,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          {courseData.course_code}
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
          {courseData.title || "Course Overview"}
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ px: 3, pt: 2, bgcolor: "background.paper" }}>
        <Tabs
          value={tab}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Tab icon={<Campaign />} iconPosition="start" label="Announcements" />
          <Tab icon={<Assignment />} iconPosition="start" label="Assignments" />
          <Tab icon={<Grade />} iconPosition="start" label="Grades" />
          <Tab icon={<People />} iconPosition="start" label="People" />
          <Tab icon={<MenuBook />} iconPosition="start" label="Course Outline" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ px: 3, pb: 4 }}>
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
      </Box>
    </Paper>
  );
}
