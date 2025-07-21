import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, useLocation, Outlet } from "react-router-dom";
import { Box, Typography, Tabs, Tab, Paper } from "@mui/material";
import { AuthContext } from "../../Auth/AuthContext";

export default function CourseDashboard() {
  const { user } = useContext(AuthContext);
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [courseData, setCourseData] = useState(null);
  const [students, setStudents] = useState([]);
  const [outlineUrl, setOutlineUrl] = useState(null);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await fetch(`http://localhost:4000/api/courses/${courseId}`);
        if (!res.ok) throw new Error("Failed to fetch course");
        const data = await res.json();
        setCourseData(data);
      } catch (err) {
        console.error("Error loading course:", err);
      }
    }

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const tabs = [
    { label: "Announcements", path: "" },
    { label: "Assignments", path: "assignments" },
    { label: "Grades & Feedback", path: "grades" },
    { label: "Students", path: "students" },
    { label: "Course Outline", path: "outline" },
    { label: "Attendance", path: "attendance" },
  ];

  const currentTabIndex = tabs.findIndex(tab => {
    const fullPath = `/dashboard/course/${courseId}/${tab.path}`;
    return (
      location.pathname === fullPath ||
      (tab.path === "" && location.pathname === `/dashboard/course/${courseId}`) ||
      (tab.path && location.pathname.startsWith(fullPath + "/"))
    );
  });

  const tabValue = currentTabIndex === -1 ? false : currentTabIndex;

  const handleTabChange = (e, newVal) => {
    const selectedPath = tabs[newVal].path;
    const basePath = `/dashboard/course/${courseId}`;
    const targetPath = selectedPath === "" ? basePath : `${basePath}/${selectedPath}`;

    if (location.pathname !== targetPath) {
      navigate(targetPath);
    } else {
      navigate(targetPath, { replace: true }); // Refresh nested
    }
  };

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
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1976d2, #42a5f5)",
          color: "white",
          p: 3,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          {courseData?.course_code || "Course Code"}
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
          {courseData?.title || "Course Overview"}
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ px: 3, pt: 2, bgcolor: "background.paper" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          {tabs.map((tab, index) => (
            <Tab key={tab.label} label={tab.label} value={index} />
          ))}
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ px: 3, pb: 4 }}>
        <Outlet
          context={{
            courseId,
            courseData,
            students,
            outlineUrl,
            user,
          }}
        />
      </Box>
    </Paper>
  );
}
