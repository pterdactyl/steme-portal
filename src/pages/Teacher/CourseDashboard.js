import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, useLocation, Outlet } from "react-router-dom";
import { Box, Typography, Tabs, Tab, Paper } from "@mui/material";
import { AuthContext } from "../../Auth/AuthContext";
import {
  Campaign,
  Assignment,
  Grade,
  People,
  MenuBook,
  EventNote,
} from "@mui/icons-material";


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
  { label: "Announcements", path: "", icon: <Campaign fontSize="small" /> },
  { label: "Assignments", path: "assignments", icon: <Assignment fontSize="small" /> },
  { label: "Grades & Feedback", path: "grades", icon: <Grade fontSize="small" /> },
  { label: "Students", path: "students", icon: <People fontSize="small" /> },
  { label: "Course Outline", path: "outline", icon: <MenuBook fontSize="small" /> },
  { label: "Attendance", path: "attendance", icon: <EventNote fontSize="small" /> },
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
          background: "linear-gradient(135deg, #66bb6a, #2e7d32)",
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
  textColor="inherit"
  variant="scrollable"
  scrollButtons="auto"
  sx={{
    borderBottom: 1,
    borderColor: "divider",
    "& .MuiTabs-indicator": {
      backgroundColor: "#2e7d32",
    },
  }}
>
  {tabs.map((tab, index) => (
    <Tab
      key={tab.label}
      label={tab.label}
      icon={tab.icon}
      iconPosition="start"
      value={index}
      sx={{
        color: "text.primary",
        "&.Mui-selected": {
          color: "#2e7d32",
          fontWeight: "bold",
        },
      }}
    />
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
