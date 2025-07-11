import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function CourseOutline() {
  const { courseId } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/course-outlines/${courseId}`);
        if (!res.ok) throw new Error("Course not found");
        const data = await res.json();
        setCourseData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    } else {
      setLoading(false);
      setError("No course ID provided.");
    }
  }, [courseId]);

  const renderAssessmentBreakdown = (data) => {
    if (!data || typeof data !== "object") return null;

    return (
      <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
        {data.description && (
          <li style={{ marginBottom: "1em" }}>
            <strong>Description:</strong> {data.description}
          </li>
        )}
        {data.termPercentage !== undefined && (
          <li>
            <strong>Term Percentage:</strong> {data.termPercentage}%
          </li>
        )}
        {data.finalAssessmentPercentage !== undefined && (
          <li>
            <strong>Final Assessment Percentage:</strong> {data.finalAssessmentPercentage}%
          </li>
        )}
        {data.finalAssessment && typeof data.finalAssessment === "object" && (
          <li>
            <strong>Final Assessment:</strong>
            <ul>
              {Object.entries(data.finalAssessment).map(([key, val]) => (
                <li key={key}>
                  {key}: {val}
                </li>
              ))}
            </ul>
          </li>
        )}
        {data.categoryWeights && typeof data.categoryWeights === "object" && (
          <li>
            <strong>Category Weights:</strong>
            <ul>
              {Object.entries(data.categoryWeights).map(([key, val]) => (
                <li key={key}>
                  {key}: {val}
                </li>
              ))}
            </ul>
          </li>
        )}
      </ul>
    );
  };

  if (loading) return <p>Loading course...</p>;
  if (error) return <p>{error}</p>;
  if (!courseData) return null;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: 900, margin: "auto", padding: 20 }}>
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>{courseData.courseTitle}</h1>

      <section style={{ marginBottom: "2rem" }}>
        {courseData.courseCode && (
          <p><strong>Course Code:</strong> {courseData.courseCode}</p>
        )}
        {courseData.courseType && (
          <p><strong>Course Type:</strong> {courseData.courseType}</p>
        )}
        {courseData.creditValue && (
          <p><strong>Credit Value:</strong> {courseData.creditValue}</p>
        )}
        {courseData.grade && (
          <p><strong>Grade:</strong> {courseData.grade}</p>
        )}
        {courseData.prerequisite && (
          <p><strong>Prerequisite:</strong> {courseData.prerequisite}</p>
        )}
        {courseData.description && (
          <p><strong>Course Description:</strong> {courseData.description}</p>
        )}
      </section>

      {Array.isArray(courseData.unitsOverview) && (
        <section style={{ marginBottom: "2rem" }}>
          <h2>Units Overview</h2>
          <table
            border="1"
            cellPadding="8"
            style={{ borderCollapse: "collapse", width: "100%", textAlign: "left" }}
          >
            <thead style={{ backgroundColor: "#f0f0f0" }}>
              <tr>
                <th>Unit</th>
                <th>Unit Titles and Descriptions</th>
                <th>Time and Sequence</th>
              </tr>
            </thead>
            <tbody>
              {courseData.unitsOverview.map((unit, idx) => (
                <tr key={idx}>
                  <td>{unit.unit}</td>
                  <td>{unit.title}</td>
                  <td>{unit.time || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {courseData.assessmentBreakdown && (
        <section>
          <h2>Assessment Breakdown</h2>
          {renderAssessmentBreakdown(courseData.assessmentBreakdown)}
        </section>
      )}
    </div>
  );
}
