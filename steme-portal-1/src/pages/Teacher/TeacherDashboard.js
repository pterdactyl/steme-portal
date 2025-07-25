import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Grid,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import { AuthContext } from "../../Auth/AuthContext";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { userId, role } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!userId || role !== "teacher") {
        setCourses([]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/courses?teacherId=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch courses");
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [userId, role]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 4, px: 2 }}>
      {/* Green Gradient Header */}
      <Paper
        elevation={3}
        sx={{
          background: "linear-gradient(135deg, #00923F, #007A34)", // Green gradient
          color: "white",
          p: 3,
          borderRadius: 3,
          mb: 4,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Welcome Back!
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
          Here are the courses you’re teaching
        </Typography>
      </Paper>

      {/* Course List */}
      {courses.length === 0 ? (
        <Typography color="text.secondary">
          You are not assigned to any courses yet. Please contact your administrator.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={3} key={course.id}>
              <Paper
                elevation={2}
                onClick={() => navigate(`/dashboard/course/${course.id}`)}
                sx={{
                  width: 250,
                  height: 150,
                  borderRadius: 2,
                  p: 2,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  bgcolor: "#E8F5E9", // Light green
                  transition: "0.3s",
                  "&:hover": {
                    boxShadow: 4,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {/* Top Section */}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <SchoolIcon sx={{ fontSize: 30, color: "#00923F", mr: 1 }} /> {/* Green icon */}
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="black"
                    noWrap
                  >
                    {course.course_code || "N/A"}
                  </Typography>
                </Box>

                {/* Bottom Section (Title) */}
                <Typography
                  variant="body2"
                  color="text.primary"
                  sx={{
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {course.title}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
