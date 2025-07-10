import { useParams, Link, Outlet, useLocation } from "react-router-dom";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../Auth/firebase";

export default function StudentCourseNavbar() {
  const { courseId } = useParams();
  const location = useLocation();
  const [teacherName, setTeacherName] = useState("");

  const currentTab = location.pathname.split("/").pop(); // gets 'stream', 'people', etc.

  const tabIndex = {
    stream: 0,
    people: 1,
    marks: 2,
  }[currentTab] || 0;

  useEffect(() => {
    async function fetchTeacher() {
      // Get course document
      const courseRef = doc(db, "courses", courseId);
      const courseSnap = await getDoc(courseRef);

      if (courseSnap.exists()) {
        const { teacherIds } = courseSnap.data();
        if (teacherIds?.[0]) {
          const teacherRef = doc(db, "users", teacherIds[0]);
          const teacherSnap = await getDoc(teacherRef);
          if (teacherSnap.exists()) {
            setTeacherName(teacherSnap.data().fullName || "Unknown Teacher");
          }
        }
      }
    }

    fetchTeacher();
  }, [courseId]);

  return (
    <Box p={2}>
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

      <Box mt={3}>
        <Outlet />
      </Box>
    </Box>
  );
}