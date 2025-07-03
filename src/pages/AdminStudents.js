import React, { useState, useEffect } from "react";
import Select from "react-select";
import { db } from "../Auth/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import {
  Typography,
  Box,
  Button,
  IconButton,
  Stack,
  Paper,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [message, setMessage] = useState("");

  // Real-time listener for students
  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "student"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(studentsData);
    });
    return () => unsubscribe();
  }, []);

  // Fetch all courses once (for select options)
  useEffect(() => {
    async function fetchCourses() {
      const snapshot = await getDocs(collection(db, "courses"));
      const coursesData = snapshot.docs.map((doc) => ({
        value: doc.id,
        label: doc.data().title,
      }));
      setAllCourses(coursesData);
    }
    fetchCourses();
  }, []);

  const handleEditClick = (student) => {
    setEditingStudentId(student.id);
    // Map student.courseIds to select options format
    const selected = allCourses.filter((course) =>
      student.courseIds?.includes(course.value)
    );
    setSelectedCourses(selected);
  };

  // Updates the student doc and courses collection
  const handleUpdateStudentCourses = async () => {
    if (!editingStudentId) return;
    const studentRef = doc(db, "users", editingStudentId);
    const newCourseIds = selectedCourses.map((c) => c.value);

    try {
      // Update student's courses (both courseIds and enrolledClasses)
      await updateDoc(studentRef, { 
        courseIds: newCourseIds,
        enrolledClasses: newCourseIds, // or separate logic if different
      });

      // Update courses collection - add/remove this student in each course
      const student = students.find((s) => s.id === editingStudentId);
      const oldCourseIds = student?.courseIds || [];

      // Courses to add student to (new but not old)
      const coursesToAdd = newCourseIds.filter((id) => !oldCourseIds.includes(id));

      // Courses to remove student from (old but not new)
      const coursesToRemove = oldCourseIds.filter((id) => !newCourseIds.includes(id));

      // Add student to new courses
      for (const courseId of coursesToAdd) {
        const courseRef = doc(db, "courses", courseId);
        const courseSnap = await getDoc(courseRef);
        if (courseSnap.exists()) {
          const data = courseSnap.data();
          const studentsInCourse = data.studentIds || [];
          if (!studentsInCourse.includes(editingStudentId)) {
            await updateDoc(courseRef, {
              studentIds: [...studentsInCourse, editingStudentId],
            });
          }
        }
      }

      // Remove student from removed courses
      for (const courseId of coursesToRemove) {
        const courseRef = doc(db, "courses", courseId);
        const courseSnap = await getDoc(courseRef);
        if (courseSnap.exists()) {
          const data = courseSnap.data();
          const studentsInCourse = data.studentIds || [];
          if (studentsInCourse.includes(editingStudentId)) {
            await updateDoc(courseRef, {
              studentIds: studentsInCourse.filter((id) => id !== editingStudentId),
            });
          }
        }
      }

      // Update local state immediately
      setStudents((prevStudents) =>
        prevStudents.map((stu) =>
          stu.id === editingStudentId ? { ...stu, courseIds: newCourseIds, enrolledClasses: newCourseIds } : stu
        )
      );

      setMessage("✅ Student courses updated.");
      setEditingStudentId(null);
      setSelectedCourses([]);
    } catch (err) {
      setMessage("❌ Error updating courses: " + err.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingStudentId(null);
    setSelectedCourses([]);
    setMessage("");
  };

  return (
    <Box sx={{ maxWidth: 900, margin: "20px auto", fontFamily: "Arial, sans-serif" }}>
      <Typography variant="h4" mb={3}>
        Admin - Students
      </Typography>

      {message && (
        <Typography
          sx={{ mb: 2, color: message.startsWith("✅") ? "green" : "red" }}
        >
          {message}
        </Typography>
      )}

      <Stack spacing={2}>
        {students.map((student) => (
          <Box key={student.id}>
            <Paper
              sx={{ p: 2, bgcolor: "#e1f5fe", display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <Box>
                <Typography variant="subtitle1">{student.fullName || "Unnamed Student"}</Typography>
                <Typography variant="body2" color="textSecondary">{student.email}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Courses:{" "}
                  {student.courseIds && student.courseIds.length > 0
                    ? student.courseIds
                        .map((cid) => allCourses.find((c) => c.value === cid)?.label || cid)
                        .join(", ")
                    : "None"}
                </Typography>
              </Box>
              <Box>
                <IconButton onClick={() => handleEditClick(student)}>
                  <EditIcon />
                </IconButton>
              </Box>
            </Paper>

            {editingStudentId === student.id && (
              <Box
                mt={1}
                mb={2}
                p={3}
                sx={{ border: "1px solid #ccc", borderRadius: 2, bgcolor: "#f0f4c3" }}
              >
                <Typography variant="h6" mb={2}>
                  Edit Student Courses
                </Typography>

                <Select
                  isMulti
                  options={allCourses}
                  value={selectedCourses}
                  onChange={setSelectedCourses}
                  placeholder="Select courses"
                />

                <Box mt={2}>
                  <Button
                    variant="contained"
                    onClick={handleUpdateStudentCourses}
                    sx={{ mr: 2 }}
                  >
                    Update
                  </Button>
                  <Button variant="outlined" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}