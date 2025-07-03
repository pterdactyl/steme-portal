// src/pages/TeacherGrades.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../Auth/firebase";

const mockStudents = [
  { uid: "student1", name: "Alice" },
  { uid: "student2", name: "Bob" },
];

const courses = [
  { id: "ENG1D", name: "Grade 9 English Academic" },
  { id: "MPM1D", name: "Grade 9 Math Academic" },
];

export default function TeacherGrades({ user }) {
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [mark, setMark] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingGrades, setExistingGrades] = useState([]);
  const [status, setStatus] = useState(null); // success / error

  useEffect(() => {
    if (selectedStudent && selectedCourse) {
      fetchExistingGrade();
    } else {
      setExistingGrades([]);
    }
  }, [selectedStudent, selectedCourse]);

  const fetchExistingGrade = async () => {
    setLoading(true);
    const gradesRef = collection(db, "grades");
    const q = query(
      gradesRef,
      where("studentId", "==", selectedStudent),
      where("courseId", "==", selectedCourse)
    );
    const querySnapshot = await getDocs(q);
    const grades = [];
    querySnapshot.forEach((doc) => {
      grades.push({ id: doc.id, ...doc.data() });
    });
    setExistingGrades(grades);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!selectedStudent || !selectedCourse || mark === "") {
      alert("Please select student, course, and enter a mark.");
      return;
    }

    setLoading(true);
    try {
      if (existingGrades.length > 0) {
        const gradeDocRef = doc(db, "grades", existingGrades[0].id);
        await updateDoc(gradeDocRef, {
          mark: Number(mark),
          teacherId: user?.uid || "unknown",
          updatedAt: new Date().toISOString(),
        });
        setStatus("updated");
      } else {
        await addDoc(collection(db, "grades"), {
          studentId: selectedStudent,
          courseId: selectedCourse,
          mark: Number(mark),
          teacherId: user?.uid || "unknown",
          createdAt: new Date().toISOString(),
        });
        setStatus("added");
      }

      setMark("");
      setSelectedStudent("");
      setSelectedCourse("");
      setExistingGrades([]);
    } catch (error) {
      console.error("Error saving grade:", error);
      setStatus("error");
    }
    setLoading(false);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Enter Student Grades
      </Typography>

      <Stack spacing={2} maxWidth={400}>
        <FormControl fullWidth>
          <InputLabel>Student</InputLabel>
          <Select
            value={selectedStudent}
            label="Student"
            onChange={(e) => setSelectedStudent(e.target.value)}
          >
            {mockStudents.map((student) => (
              <MenuItem key={student.uid} value={student.uid}>
                {student.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Course</InputLabel>
          <Select
            value={selectedCourse}
            label="Course"
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            {courses.map((course) => (
              <MenuItem key={course.id} value={course.id}>
                {course.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Mark (%)"
          type="number"
          inputProps={{ min: 0, max: 100 }}
          value={mark}
          onChange={(e) => setMark(e.target.value)}
          fullWidth
        />

        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {existingGrades.length > 0 ? "Update Grade" : "Add Grade"}
        </Button>

        {loading && <CircularProgress size={24} />}
        {status === "added" && <Alert severity="success">Grade added successfully!</Alert>}
        {status === "updated" && <Alert severity="info">Grade updated successfully!</Alert>}
        {status === "error" && <Alert severity="error">Failed to save grade.</Alert>}
      </Stack>
    </Box>
  );
}
