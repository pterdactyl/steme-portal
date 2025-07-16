import React, { useEffect, useState, useContext } from "react";
import {
  Box, Table, TableHead, TableRow, TableCell,
  TableBody, TextField, Typography, Paper
} from "@mui/material";
import { useOutletContext } from "react-router-dom";
import { AuthContext } from "../../Auth/AuthContext";

export default function GradesTab() {
  const { courseId } = useOutletContext();
  const { userId } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState({}); // { "studentId-assignmentId": grade }
  const [activeField, setActiveField] = useState(null); // track which input is focused or hovered

  useEffect(() => {
    async function fetchData() {
      const [studentRes, assignmentRes, gradeRes] = await Promise.all([
        fetch(`http://localhost:4000/api/courses/${courseId}`),
        fetch(`http://localhost:4000/api/assignments?course_id=${courseId}`),
        fetch(`http://localhost:4000/api/grades/${courseId}`)
      ]);

      const [studentsData, assignmentsData, gradesData] = await Promise.all([
        studentRes.json(),
        assignmentRes.json(),
        gradeRes.json()
      ]);

      // Sort assignments by due date ascending
      assignmentsData.sort((a, b) => new Date(b.due_date) - new Date(a.due_date));

      const gradeMap = {};
      gradesData.forEach(g => {
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
      setGrades(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  // Save grade on blur or Enter key press
  const handleGradeSubmit = (studentId, assignmentId) => {
    const key = `${studentId}-${assignmentId}`;
    const gradeValue = grades[key];
    const numericGrade = gradeValue === "" ? null : Number(gradeValue);

    // Only save if grade is valid number or null (empty)
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

  // Optional: handle Enter key submit in input field
  const handleKeyDown = (e, studentId, assignmentId) => {
    if (e.key === "Enter") {
      e.target.blur(); // triggers onBlur and saves grade
    }
  };

  return (
    <Box>
      <Paper sx={{ overflowX: "auto" }}>
        <Table size="small" sx={{ minWidth: "100%" }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ minWidth: 180, fontWeight: "bold", backgroundColor: "#f0f0f0" }}
              >
                Student
              </TableCell>
              {assignments.map((assignment) => (
                <TableCell
                  key={assignment.id}
                  sx={{
                    width: 120,
                    maxWidth: 120,
                    whiteSpace: "normal",
                    wordWrap: "break-word",
                    padding: "8px",
                    textAlign: "center",
                    backgroundColor: "#f9f9f9",
                    verticalAlign: "top",
                  }}
                >
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {assignment.due_date
                      ? (() => {
                          const date = new Date(assignment.due_date);
                          const now = new Date();
                          const formatOptions = { day: "numeric", month: "short" };
                          if (date.getFullYear() !== now.getFullYear()) {
                            formatOptions.year = "numeric";
                          }
                          return date.toLocaleDateString("en-GB", formatOptions);
                        })()
                      : "No due date"}
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    sx={{
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                      marginTop: "4px",
                      fontSize: "0.85rem",
                      cursor: "pointer", 
                      color: "#275ec4",      
                      textDecoration: "underline"  
                      
                    }}
                    onClick={() =>
                        window.open(`/dashboard/course/${courseId}/assignment/${assignment.id}/submissions`, "_blank")
                      }
                  >
                    {assignment.title}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id} hover>
                <TableCell sx={{ minWidth: 180, backgroundColor: "#fafafa" }}>
                  {student.name}
                </TableCell>
                {assignments.map((assignment) => {
                  const key = `${student.id}-${assignment.id}`;
                  return (
                    <TableCell key={key} sx={{ width: 120, maxWidth: 120, padding: "4px" }}>
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
                        InputProps={{
                          endAdornment:
                            activeField === key ? (
                              <Typography variant="caption" sx={{ fontSize: "14px", ml: 0.5 }}>
                                /100
                              </Typography>
                            ) : null,
                          disableUnderline: false,
                        }}
                        variant="standard"
                        sx={{
                          '& input[type=number]': {
                            MozAppearance: 'textfield',
                          },
                          '& input[type=number]::-webkit-outer-spin-button': {
                            WebkitAppearance: 'none',
                            margin: 0,
                          },
                          '& input[type=number]::-webkit-inner-spin-button': {
                            WebkitAppearance: 'none',
                            margin: 0,
                          },
                        }}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
            {/* Add class average row */}
            <TableRow sx={{ backgroundColor: "#e0e0e0", fontWeight: "bold" }}>
              <TableCell>Class Average</TableCell>
              {assignments.map((assignment) => {
                // Calculate average grade for this assignment
                const gradesForAssignment = students
                  .map((student) => grades[`${student.id}-${assignment.id}`])
                  .filter((g) => g !== undefined && g !== "" && g !== null)
                  .map(Number);
                const avg =
                  gradesForAssignment.length > 0
                    ? (
                        gradesForAssignment.reduce((a, b) => a + b, 0) /
                        gradesForAssignment.length
                      ).toFixed(1)
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
      </Paper>
    </Box>
  );
}