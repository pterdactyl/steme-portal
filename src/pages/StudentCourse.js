import { Box } from "@mui/material";
import StudentCourseNavbar from "../components/StudentCourseNavbar";
import { Outlet } from "react-router-dom";

export default function CoursePage() {
  return (
    <Box p={2}>
      <StudentCourseNavbar />
      <Box mt={3}>
        <Outlet />
      </Box>
    </Box>
  );
}