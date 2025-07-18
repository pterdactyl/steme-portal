import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, useLocation, Outlet } from "react-router-dom";
import { Box, Typography, Tabs, Tab } from "@mui/material";
import { AuthContext } from "../../Auth/AuthContext"; // ✅ Import context

export default function CourseDashboard() {
  const { user } = useContext(AuthContext); // ✅ Get user from context
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
      (tab.path && location.pathname.startsWith(fullPath + "/")) // Matches attendance/2/history
    );
  });
  const tabValue = currentTabIndex === -1 ? false : currentTabIndex;

  const handleTabChange = (e, newVal) => {
    const selectedPath = tabs[newVal].path;
    const basePath = `/dashboard/course/${courseId}`;
    const targetPath = selectedPath === "" ? basePath : `${basePath}/${selectedPath}`;
  
    // Only navigate if it's actually different
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    } else {
      // Force navigation to reset nested component
      navigate(targetPath, { replace: true });
    }
  
    console.log("Navigating to:", targetPath);
  };

  return (
    <Box p={3}>
      <Box mb={2}>
        <Typography variant="h6" sx={{ lineHeight: 1.3 }}>
          {courseData?.course_code || "Course Code"}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ lineHeight: 1.2 }}>
          {courseData?.teachers?.[0]?.name || "Unnamed Teacher"}
        </Typography>
      </Box>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{ mb: 3 }}
        variant="scrollable"
        scrollButtons="auto"
        indicatorColor="primary"
        textColor="primary"
      >
        {tabs.map((tab, index) => (
          <Tab key={tab.label} label={tab.label} value={index} />
        ))}
      </Tabs>

      {/* Pass course info and user into all tabs */}
      <Outlet
        context={{
          courseId,
          courseData,
          students,
          outlineUrl,
          user, // ✅ Provided to nested tabs like AnnouncementsTab
        }}
      />
    </Box>
  );
}
