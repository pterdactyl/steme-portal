import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Outlet } from "react-router-dom";
import { db } from "../../Auth/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { Box, Typography, Tabs, Tab } from "@mui/material";

export default function CourseDashboard() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [courseData, setCourseData] = useState(null);
  const [students, setStudents] = useState([]);
  const [outlineUrl, setOutlineUrl] = useState(null);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const courseRef = doc(db, "courses", courseId);
        const courseSnap = await getDoc(courseRef);
        if (courseSnap.exists()) {
          const data = courseSnap.data();
          setCourseData(data);
      

          if (data.currentVersion) {
            const versionRef = doc(db, "courses", courseId, "versions", data.currentVersion);
            const versionSnap = await getDoc(versionRef);
            setOutlineUrl(versionSnap.exists() ? versionSnap.data().pdf : null);
          } else {
            setOutlineUrl(null);
          }
        }
      } catch (err) {
        console.error("Error fetching course data:", err);
      }
    }
    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const q = query(
          collection(db, "users"),
          where("role", "==", "student"),
          where("courseIds", "array-contains", courseId)
        );
        const snapshot = await getDocs(q);
        setStudents(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    }
    fetchStudents();
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

  if (!courseData) {
    return <Typography p={3}>Loading course data...</Typography>;
  }

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>
        {courseData.title || "Course Dashboard"}
      </Typography>

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

      {/* Nested routes render here */}
      <Outlet
        context={{
          courseId,
          courseData,
          students,
          outlineUrl,
        }}
      />
    </Box>
  );
}
