import { useParams, Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import { useEffect, useState } from "react";

export default function StudentCourseNavbar() {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [teacherName, setTeacherName] = useState("");

  // Determine active tab from URL
  const pathParts = location.pathname.split("/");
  const currentTab = pathParts[pathParts.length - 1];

  const tabIndexMap = {
    stream: 0,
    people: 1,
    marks: 2,
  };
  const isTabRoute = ["stream", "people", "marks"].includes(currentTab);
  const tabIndex = isTabRoute ? tabIndexMap[currentTab] : 0;

  // Fetch teacher name from backend (Azure SQL via API)
  useEffect(() => {
    async function fetchTeacherName() {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/teacher-name?courseId=${courseId}`);
        if (!res.ok) throw new Error("Failed to fetch teacher name");
        const data = await res.json();
        setTeacherName(data.fullName || "Unassigned Teacher");
      } catch (err) {
        console.error("Error fetching teacher name:", err);
        setTeacherName("Unassigned Teacher");
      }
    }

    fetchTeacherName();
  }, [courseId]);

  return (
    <Box p={2}>
      {/* Back to dashboard */}
      <Typography
        variant="body2"
        color="primary"
        sx={{ cursor: "pointer", mb: 2 }}
        onClick={() => navigate("/dashboard/student")}
      >
        ← Back to My Courses
      </Typography>

      {/* Header and tabs */}
      <Box display="flex" alignItems="center" gap={4}>
        <Box>
          <Typography variant="h6">{courseId}</Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {teacherName}
          </Typography>
        </Box>
        <Tabs value={tabIndex} textColor="primary" indicatorColor="primary">
          <Tab label="Stream" component={Link} to="stream" />
          <Tab label="People" component={Link} to="people" />
          <Tab label="Marks" component={Link} to="marks" />
        </Tabs>
      </Box>

      {/* Render current tab content */}
      <Box mt={3}>
        <Outlet />
      </Box>
    </Box>
  );
}
