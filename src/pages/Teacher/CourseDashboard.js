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
  ];

  const lastSegment = location.pathname.split("/").pop();
  const currentTabIndex = tabs.findIndex((tab) =>
    tab.path === lastSegment || (tab.path === "" && location.pathname.endsWith(courseId))
  );
  const tabValue = currentTabIndex === -1 ? 0 : currentTabIndex;

  const handleTabChange = (e, newVal) => {
    const selectedPath = tabs[newVal].path;
    navigate(
      selectedPath === ""
        ? `/dashboard/course/${courseId}`
        : `/dashboard/course/${courseId}/${selectedPath}`
    );
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
