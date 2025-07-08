import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../Auth/firebase";

export default function CourseOutline() {
  const { courseId } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const docRef = doc(db, "studentCourseOutlines", courseId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setCourseData(docSnap.data());
          setError(null);
        } else {
          setError("Course not found.");
          setCourseData(null);
        }
      } catch (err) {
        setError(`Failed to load course data: ${err.message}`);
        setCourseData(null);
        console.error(err);
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

  // Custom render function for Assessment Breakdown
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
        {data["Final Assessment"] && typeof data["Final Assessment"] === "object" && (
          <li>
            <strong>Final Assessment:</strong>
            <ul>
              {Object.entries(data["Final Assessment"]).map(([key, val]) => (
                <li key={key}>
                  {key}: {val}
                </li>
              ))}
            </ul>
          </li>
        )}
        {data["Category Weights"] && typeof data["Category Weights"] === "object" && (
          <li>
            <strong>Category Weights:</strong>
            <ul>
              {Object.entries(data["Category Weights"]).map(([key, val]) => (
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
      {/* Course Title at the top */}
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>{courseData["Course Title"]}</h1>

      {/* Course Details */}
      <section style={{ marginBottom: "2rem" }}>
        {courseData["Course Code"] && (
          <p>
            <strong>Course Code</strong> {courseData["Course Code"]}
          </p>
        )}
        {courseData["Course Type"] && (
          <p>
            <strong>Course Type</strong> {courseData["Course Type"]}
          </p>
        )}
        {courseData["Credit Value"] && (
          <p>
            <strong>Credit Value</strong> {courseData["Credit Value"]}
          </p>
        )}
        {courseData["Grade"] && (
          <p>
            <strong>Grade</strong> {courseData["Grade"]}
          </p>
        )}
        {courseData["Prerequisite"] && (
          <p>
            <strong>Prerequisite</strong> {courseData["Prerequisite"]}
          </p>
        )}
        {courseData["Course Description"] && (
          <p>
            <strong>Course Description</strong> {courseData["Course Description"]}
          </p>
        )}
      </section>

      {/* Units Overview Table */}
      {Array.isArray(courseData["Units Overview"]) && (
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
              {courseData["Units Overview"].map((unit, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #ddd" }}>
                  <td>{unit.Unit}</td>
                  <td>{unit.Title}</td>
                  <td>{unit.Time || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Assessment Breakdown */}
      {courseData["Assessment Breakdown"] && (
        <section>
          <h2>Assessment Breakdown</h2>
          {renderAssessmentBreakdown(courseData["Assessment Breakdown"])}
        </section>
      )}
    </div>
  );
}
