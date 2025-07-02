import React, { useState, useEffect } from "react";
import Select from "react-select";
import { db } from "../Auth/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  Typography,
  Box,
  Paper,
  Stack,
  Button,
  CircularProgress,
} from "@mui/material";

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch all teachers
  useEffect(() => {
    async function fetchTeachers() {
      const q = query(collection(db, "users"), where("role", "==", "teacher"));
      const snapshot = await getDocs(q);
      const teachersList = snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      }));
      setTeachers(teachersList);
    }

    fetchTeachers();
  }, []);

  // Fetch all courses
  useEffect(() => {
    async function fetchCourses() {
      const snapshot = await getDocs(collection(db, "courses"));
      const coursesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCourses(coursesList);
      setLoading(false);
    }

    fetchCourses();
  }, []);

  // When teacher changes, update assigned courses
  useEffect(() => {
    if (!selectedTeacher) {
      setSelectedCourses([]);
      return;
    }
    const assigned = courses.filter((course) =>
      course.teacherIds?.includes(selectedTeacher.uid)
    );
    const selected = assigned.map((course) => ({
      value: course.id,
      label: course.title,
    }));
    setSelectedCourses(selected);
  }, [selectedTeacher, courses]);

  // Options for all courses (for select dropdown)
  const courseOptions = courses.map((course) => ({
    value: course.id,
    label: course.title,
  }));

  // Handle saving course assignments for the teacher
  const handleSave = async () => {
    if (!selectedTeacher) return;
    setSaving(true);
    setMessage("");

    try {
      const selectedCourseIds = selectedCourses.map((c) => c.value);

      // Update each course's teacherIds accordingly
      const updates = courses.map(async (course) => {
        const hasTeacher = course.teacherIds?.includes(selectedTeacher.uid);
        const shouldHaveTeacher = selectedCourseIds.includes(course.id);

        if (hasTeacher && !shouldHaveTeacher) {
          const updatedIds = course.teacherIds.filter((id) => id !== selectedTeacher.uid);
          const courseRef = doc(db, "courses", course.id);
          await updateDoc(courseRef, { teacherIds: updatedIds });
        } else if (!hasTeacher && shouldHaveTeacher) {
          const updatedIds = course.teacherIds ? [...course.teacherIds, selectedTeacher.uid] : [selectedTeacher.uid];
          const courseRef = doc(db, "courses", course.id);
          await updateDoc(courseRef, { teacherIds: updatedIds });
        }
      });

      await Promise.all(updates);
      setMessage("✅ Courses updated for teacher.");
    } catch (error) {
      setMessage("❌ Error updating courses: " + error.message);
    }

    setSaving(false);
  };

  return (
    <Box maxWidth={900} margin="20px auto" fontFamily="Arial, sans-serif" padding={2}>
      <Typography variant="h4" mb={3}>
        Teacher Management
      </Typography>

      <Box display="flex" gap={4}>
        {/* Teacher List */}
        <Paper sx={{ flex: 1, maxHeight: 600, overflowY: "auto", padding: 2 }}>
          <Typography variant="h6" mb={1}>All Teachers</Typography>
          <Stack spacing={1}>
            {teachers.length === 0 && <Typography>No teachers found.</Typography>}
            {teachers.map((teacher) => (
              <Box
                key={teacher.uid}
                sx={{
                  padding: "8px 12px",
                  borderRadius: 1,
                  backgroundColor: selectedTeacher?.uid === teacher.uid ? "#b3e5fc" : "#f0f0f0",
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "#90caf9" },
                }}
                onClick={() => setSelectedTeacher(teacher)}
              >
                {teacher.fullName || teacher.email || teacher.uid}
              </Box>
            ))}
          </Stack>
        </Paper>

        {/* Selected Teacher Courses and Edit */}
        <Paper sx={{ flex: 2, padding: 2, minHeight: 300 }}>
          {!selectedTeacher ? (
            <Typography>Select a teacher to view and edit courses.</Typography>
          ) : (
            <>
              <Typography variant="h6" mb={2}>
                Courses Assigned to {selectedTeacher.fullName || selectedTeacher.email}
              </Typography>

              {loading ? (
                <CircularProgress />
              ) : (
                <>
                  <Select
                    isMulti
                    options={courseOptions}
                    value={selectedCourses}
                    onChange={setSelectedCourses}
                    placeholder="Select courses to assign"
                  />

                  <Box mt={2}>
                    <Button variant="contained" onClick={handleSave} disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </Box>

                  {message && (
                    <Typography
                      mt={2}
                      color={message.startsWith("✅") ? "green" : "red"}
                    >
                      {message}
                    </Typography>
                  )}
                </>
              )}
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
}