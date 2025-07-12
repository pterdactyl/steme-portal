import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Auth/AuthContext";
import {
  Box,
  Typography,
  Paper,
  Stack,
  IconButton,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user, role, userId } = useContext(AuthContext);

  const [courses, setCourses] = useState([]);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      if (!userId || role !== "teacher") {
        setCourses([]);
        return;
      }

      try {
        const response = await fetch(`http://localhost:4000/api/courses?teacherId=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses([]);
      }
    };

    fetchCourses();
  }, [userId, role]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const handleMenuClick = (event, courseId) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedCourse(courseId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCourse(null);
  };

  const handleAction = (action) => {
    if (action === "Edit") {
      navigate(`/edit/${selectedCourse}`);
    } else {
      alert(`${action} clicked for course ID ${selectedCourse}`);
    }
    handleMenuClose();
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(filterText.toLowerCase()) ||
    course.course_code.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        My Courses
      </Typography>

      <Box mb={2} maxWidth={300}>
        <input
          type="text"
          placeholder="Search courses..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        />
      </Box>

      <Stack spacing={2}>
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <Paper
              key={course.id}
              sx={{
                p: 2,
                cursor: "pointer",
                bgcolor: "#b3e5fc",
              }}
              onClick={() => navigate(`/dashboard/course/${course.id}`)}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{ cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/dashboard/course/${course.id}`);
                  }}
                >
                  {course.title}
                </Typography>
                <IconButton onClick={(e) => handleMenuClick(e, course.id)}>
                  <MoreVertIcon />
                </IconButton>
              </Box>
            </Paper>
          ))
        ) : (
          <Typography>No courses found.</Typography>
        )}
      </Stack>
    </Box>
  );
}