import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Typography,
  Paper,
  TableContainer,
  Link,
} from "@mui/material";
import { useOutletContext } from "react-router-dom";
import { AuthContext } from "../../Auth/AuthContext";

export default function GradesTab() {
  const { courseId } = useOutletContext();
  const { userId } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState({}); // { "studentId-assignmentId": grade }
  const [activeField, setActiveField] = useState(null); // track input focus

  useEffect(() => {
    async function fetchData() {
      const [studentRes, assignmentRes, gradeRes] = await Promise.all([
        fetch(`http://localhost:4000/api/courses/${courseId}`),
        fetch(`http://localhost:4000/api/assignments?course_id=${courseId}`),
        fetch(`http://localhost:4000/api/grades/${courseId}`),
      ]);

      const [studentsData, assignmentsData, gradesData] = await Promise.all([
        studentRes.json(),
        assignmentRes.json(),
        gradeRes.json(),
      ]);

      // Sort assignments by due date descending (latest first)
      assignmentsData.sort((a, b) => new Date(b.due_date) - new Date(a.due_date));

      const gradeMap = {};
      gradesData.forEach((g) => {
        gradeMap[`${g.student_id}-${g.assignment_id}`] = g.grade;
      });

      setStudents(studentsData.students);
      setAssignments(assignmentsData);
      setGrades(gradeMap);
    }

    fetchData();
  }, [courseId]);

  const handleGradeChange = (studentId, assignmentId, value) => {
    const key = `${studentId}-${assignmentId}`;
    const numericGrade = value === "" ? "" : Number(value);

    if (value === "" || (!isNaN(numericGrade) && numericGrade >= 0 && numericGrade <= 100)) {
      setGrades((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  const handleGradeSubmit = (studentId, assignmentId) => {
    const key = `${studentId}-${assignmentId}`;
    const gradeValue = grades[key];
    const numericGrade = gradeValue === "" ? null : Number(gradeValue);

    if (gradeValue === "" || (!isNaN(numericGrade) && numericGrade >= 0 && numericGrade <= 100)) {
      fetch("http://localhost:4000/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          assignment_id: assignmentId,
          grade: numericGrade,
          recorded_by: userId,
        }),
      });
    }
  };

  const handleKeyDown = (e, studentId, assignmentId) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  };

  return (
    <Box mt={4}>
      <Typography variant="h5" gutterBottom fontWeight={1000} color="black">
        Grades for Students
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Table size="small" sx={{ minWidth: "100%" }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
              <TableCell sx={{ minWidth: 180, fontWeight: "bold" }}>Student</TableCell>
              {assignments.map((assignment) => (
                <TableCell
  key={assignment.id}
  sx={{
    width: 140,
    maxWidth: 140,
    fontWeight: "bold",
    textAlign: "center",
    whiteSpace: "normal",
    wordWrap: "break-word",
    padding: "8px",
  }}
>
  <Link
    href={`/dashboard/course/${courseId}/assignment/${assignment.id}/submissions`}
    target="_blank"
    underline="hover"
    sx={{
      display: "block",
      fontWeight: "bold",
      fontSize: "0.85rem",
      marginTop: 0.5,
      color: "#275ec4",
      cursor: "pointer",
    }}
  >
    {assignment.title}
  </Link>
</TableCell>

              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {students.map((student, rowIndex) => (
              <TableRow
                key={student.id}
                hover
                sx={{ backgroundColor: rowIndex % 2 === 0 ? "#fafafa" : "white" }}
              >
                <TableCell sx={{ minWidth: 180, backgroundColor: "#fafafa" }}>
                  {student.name}
                </TableCell>

                {assignments.map((assignment) => {
                  const key = `${student.id}-${assignment.id}`;
                  return (
                    <TableCell key={key} sx={{ width: 140, maxWidth: 140, padding: "4px" }}>
                      <TextField
                        fullWidth
                        type="number"
                        value={grades[key] ?? ""}
                        onChange={(e) =>
                          handleGradeChange(student.id, assignment.id, e.target.value)
                        }
                        onBlur={() => {
                          setActiveField(null);
                          handleGradeSubmit(student.id, assignment.id);
                        }}
                        onFocus={() => setActiveField(key)}
                        onMouseEnter={() => setActiveField(key)}
                        onMouseLeave={() => setActiveField(null)}
                        onKeyDown={(e) => handleKeyDown(e, student.id, assignment.id)}
                        inputProps={{
                          min: 0,
                          max: 100,
                          inputMode: "numeric",
                          style: { fontSize: "14px", textAlign: "center" },
                          pattern: "[0-9]*",
                        }}
                        variant="standard"
                        sx={{
                          '& input[type=number]': {
                            MozAppearance: "textfield",
                          },
                          '& input[type=number]::-webkit-outer-spin-button': {
                            WebkitAppearance: "none",
                            margin: 0,
                          },
                          '& input[type=number]::-webkit-inner-spin-button': {
                            WebkitAppearance: "none",
                            margin: 0,
                          },
                        }}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}

            {/* Class average row */}
            <TableRow sx={{ backgroundColor: "#e0e0e0", fontWeight: "bold" }}>
              <TableCell>Class Average</TableCell>
              {assignments.map((assignment) => {
                const gradesForAssignment = students
                  .map((student) => grades[`${student.id}-${assignment.id}`])
                  .filter((g) => g !== undefined && g !== "" && g !== null)
                  .map(Number);
                const avg =
                  gradesForAssignment.length > 0
                    ? (gradesForAssignment.reduce((a, b) => a + b, 0) / gradesForAssignment.length).toFixed(1)
                    : "-";
                return (
                  <TableCell key={assignment.id} align="center">
                    {avg !== "-" ? avg : "-"}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
