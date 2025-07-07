import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../Auth/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Paper,
  TextField,
  List,
  ListItem,
} from "@mui/material";

export default function CourseDashboard() {
  const { courseId } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [tab, setTab] = useState(0);
  const [announcementText, setAnnouncementText] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [students, setStudents] = useState([]);
  const [outlineUrl, setOutlineUrl] = useState(null); // <-- added state for outline PDF url

  // Fetch course data + announcements + outline URL
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseRef = doc(db, "courses", courseId);
        const courseSnap = await getDoc(courseRef);

        if (courseSnap.exists()) {
          const data = courseSnap.data();
          setCourseData(data);
          setAnnouncements(data.announcements || []);

          // Fetch the outline PDF URL from the current version doc
          if (data.currentVersion) {
            const versionRef = doc(db, "courses", courseId, "versions", data.currentVersion);
            const versionSnap = await getDoc(versionRef);
            if (versionSnap.exists()) {
              setOutlineUrl(versionSnap.data().pdf || null);
            } else {
              setOutlineUrl(null);
            }
          } else {
            setOutlineUrl(null);
          }
        } else {
          console.error("Course not found:", courseId);
        }
      } catch (err) {
        console.error("Error fetching course data:", err);
      }
    };

    fetchCourse();
  }, [courseId]);

  // Fetch enrolled students (from users collection)
  useEffect(() => {
    if (!courseId) return;

    const fetchStudents = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("role", "==", "student"),
          where("courseIds", "array-contains", courseId)
        );

        const snapshot = await getDocs(q);
        const studentList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStudents(studentList);
      } catch (err) {
        console.error("Error fetching students:", err);
        setStudents([]);
      }
    };

    fetchStudents();
  }, [courseId]);

  const handlePostAnnouncement = async () => {
    if (!announcementText.trim()) return;

    const newAnnouncement = {
      id: Date.now(),
      text: announcementText.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedAnnouncements = [newAnnouncement, ...announcements];

    try {
      const docRef = doc(db, "courses", courseId);
      await updateDoc(docRef, { announcements: updatedAnnouncements });
      setAnnouncements(updatedAnnouncements);
      setAnnouncementText("");
    } catch (error) {
      console.error("Failed to post announcement:", error);
    }
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
        value={tab}
        onChange={(e, newVal) => setTab(newVal)}
        sx={{ mb: 3 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Announcements" />
        <Tab label="Assignments" />
        <Tab label="Grades & Feedback" />
        <Tab label="Students" />
        <Tab label="Course Outline" />
      </Tabs>

      {/* Announcements */}
      {tab === 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Post Announcement</Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="New announcement"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            sx={{ my: 2 }}
          />
          <Button variant="contained" onClick={handlePostAnnouncement}>
            Post
          </Button>

          <Box mt={3}>
            {announcements.length === 0 ? (
              <Typography>No announcements yet.</Typography>
            ) : (
              announcements.map((a) => (
                <Paper key={a.id} sx={{ p: 1, mb: 1 }}>
                  <Typography>{a.text}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(a.createdAt).toLocaleString()}
                  </Typography>
                </Paper>
              ))
            )}
          </Box>
        </Paper>
      )}

      {/* Assignments */}
      {tab === 1 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Assignments</Typography>
          <Typography sx={{ mt: 1, fontStyle: "italic" }}>
            Coming soon...
          </Typography>
        </Paper>
      )}

      {/* Grades & Feedback */}
      {tab === 2 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Grades & Feedback</Typography>
          <Typography sx={{ mt: 1, fontStyle: "italic" }}>
            Coming soon...
          </Typography>
        </Paper>
      )}

      {/* Students */}
      {tab === 3 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" mb={2}>
            Enrolled Students
          </Typography>
          {students.length === 0 ? (
            <Typography>No students enrolled.</Typography>
          ) : (
            <List>
              {students.map((student) => (
                <ListItem key={student.id}>
                  <Typography>
                    {student.fullName || student.email || student.id}
                  </Typography>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      )}

      {/* Course Outline */}
      {tab === 4 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Course Outline
          </Typography>

          {outlineUrl ? (
            <iframe
              src={outlineUrl}
              width="100%"
              height="600px"
              style={{ border: "1px solid #ccc", borderRadius: "8px" }}
              title="Course Outline PDF"
            />
          ) : (
            <Typography>No outline provided.</Typography>
          )}
        </Paper>
      )}
    </Box>
  );
}
