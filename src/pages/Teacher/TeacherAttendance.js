import React, { useState, useEffect } from "react";
import { db } from "../../Auth/firebase";
import { getAuth } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import {
  Typography,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Stack,
} from "@mui/material";

export default function TeacherAttendance() {
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [students, setStudents] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(() => {
    // Default to today in yyyy-mm-dd format
    const today = new Date().toISOString().slice(0, 10);
    return today;
  });
  const [attendanceData, setAttendanceData] = useState({}); // { studentId: "Present"|"Absent" }
  const auth = getAuth();
  const teacherId = auth.currentUser?.uid;

  // Fetch teacher's courses
  useEffect(() => {
    if (!teacherId) return;

    const coursesQuery = query(
      collection(db, "courses"),
      where("teacherIds", "array-contains", teacherId)
    );

    const unsubscribeCourses = onSnapshot(coursesQuery, (snapshot) => {
      const coursesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTeacherCourses(coursesData);
      if (coursesData.length > 0 && !selectedCourseId) {
        setSelectedCourseId(coursesData[0].id);
      } else if (coursesData.length === 0) {
        setSelectedCourseId("");
        setStudents([]);
      }
    });

    return () => unsubscribeCourses();
  }, [teacherId]);

  // Fetch students for selected course
  useEffect(() => {
    if (!selectedCourseId) {
      setStudents([]);
      return;
    }

    const studentsQuery = query(
      collection(db, "users"),
      where("role", "==", "student"),
      where("courseIds", "array-contains", selectedCourseId)
    );

    const unsubscribeStudents = onSnapshot(studentsQuery, (snapshot) => {
      const studentsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setStudents(studentsData);
    });

    return () => unsubscribeStudents();
  }, [selectedCourseId]);

  // Fetch attendance data for selected course and date
  useEffect(() => {
    if (!selectedCourseId || !attendanceDate) {
      setAttendanceData({});
      return;
    }

    const attendanceDocRef = doc(
      db,
      "courses",
      selectedCourseId,
      "attendance",
      attendanceDate
    );

    getDoc(attendanceDocRef).then((docSnap) => {
      if (docSnap.exists()) {
        setAttendanceData(docSnap.data());
      } else {
        setAttendanceData({});
      }
    });
  }, [selectedCourseId, attendanceDate]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedCourseId || !attendanceDate) return;

    try {
      const attendanceDocRef = doc(
        db,
        "courses",
        selectedCourseId,
        "attendance",
        attendanceDate
      );

      await setDoc(attendanceDocRef, attendanceData);
      alert("Attendance saved successfully!");
    } catch (error) {
      alert("Error saving attendance: " + error.message);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, margin: "20px auto", fontFamily: "Arial, sans-serif" }}>
      <Typography variant="h4" mb={3}>
        Attendance Management
      </Typography>

      {/* Course selector */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="course-select-label">Select Course</InputLabel>
        <Select
          labelId="course-select-label"
          value={selectedCourseId}
          label="Select Course"
          onChange={(e) => setSelectedCourseId(e.target.value)}
          disabled={teacherCourses.length === 0}
        >
          {teacherCourses.map((course) => (
            <MenuItem key={course.id} value={course.id}>
              {course.title || course.name || course.id}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Date picker */}
      <TextField
        label="Select Date"
        type="date"
        value={attendanceDate}
        onChange={(e) => setAttendanceDate(e.target.value)}
        sx={{ mb: 3 }}
        InputLabelProps={{
          shrink: true,
        }}
        fullWidth
      />

      {/* Attendance list */}
      <Typography variant="h6" gutterBottom>
        Mark Attendance
      </Typography>

      {students.length === 0 ? (
        <Typography>No students found for this course.</Typography>
      ) : (
        <Stack spacing={2}>
          {students.map((student) => (
            <Box
              key={student.id}
              sx={{
                p: 2,
                border: "1px solid #ccc",
                borderRadius: 1,
                backgroundColor: "#f9f9f9",
              }}
            >
              <Typography variant="subtitle1" gutterBottom>
                {student.fullName || student.email}
              </Typography>

              <RadioGroup
                row
                value={attendanceData[student.id] || "Absent"}
                onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
              >
                <FormControlLabel value="Present" control={<Radio />} label="Present" />
                <FormControlLabel value="Absent" control={<Radio />} label="Absent" />
              </RadioGroup>
            </Box>
          ))}
        </Stack>
      )}

      <Box mt={4}>
        <Button variant="contained" onClick={handleSaveAttendance} disabled={students.length === 0}>
          Save Attendance
        </Button>
      </Box>
    </Box>
  );
}
