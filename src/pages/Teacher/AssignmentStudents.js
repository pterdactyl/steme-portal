import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function AssignmentStudents() {
  const { courseId, assignmentId } = useParams();
  const [courseData, setCourseData] = useState(null); // whole response object

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch(`http://localhost:4000/api/courses/${courseId}`);
        const data = await res.json();
        console.log("Fetched course data:", data);
        setCourseData(data);
      } catch (err) {
        console.error("Error fetching students", err);
      }
    }

    fetchStudents();
  }, [courseId]);

  const openSubmissionPage = (studentId) => {
    const url = `/dashboard/course/${courseId}/assignment/${assignmentId}/submissions?studentId=${studentId}`;
    window.open(url, "_blank");
  };

  if (!courseData) return <div>Loading students...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Students in Course {courseId}</h2>
      <ul>
        {courseData.students.map((student) => (
          <li key={student.id}>
            <button
              onClick={() => openSubmissionPage(student.id)}
              style={{ cursor: "pointer", color: "#007bff", background: "none", border: "none" }}
            >
              {student.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}