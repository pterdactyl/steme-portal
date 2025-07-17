import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import OutlineContent from "./OutlineContent";

export default function ViewOutline() {
  const { courseCode } = useParams();  // ✅ use courseCode, not courseId

  const [outline, setOutline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation(); 
  const courseFromState = location.state?.course;

  useEffect(() => {
    if (!courseCode) {
      setError("No course code provided in URL.");
      setLoading(false);
      return;
    }

    const fetchOutline = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/outlines/by-course-code/${courseCode}`);
        if (!res.ok) throw new Error("Failed to fetch outline");

        const data = await res.json();

        setOutline({
          courseCode: courseCode,
          courseName: data.course_name || "",
          grade: data.grade || "",
          courseType: data.course_type || "",
          credit: data.credit || "",
          description: data.description || "",
          learningGoals: data.learning_goals || "",
          assessment: data.assessment || "",
          units: data.units || [],
          finalAssessments: data.final_assessments || [],
          totalHours: data.total_hours || 0,
        });
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load course data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOutline();
  }, [courseCode]);

  if (loading) {
    return <div style={{ textAlign: "center", padding: "50px" }}>Loading...</div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "50px", color: "red" }}>
        Error: {error}
      </div>
    );
  }

  if (!outline) {
    const blankOutline = {
      courseCode: courseCode,
      courseName: "No Outline Found",
      grade: "",
      courseType: "",
      credit: "",
      description: "",
      learningGoals: "",
      assessment: "",
    };
    return (
      <OutlineContent
        outline={blankOutline}
        units={[]}
        finalAssessments={[]}
        totalHours={0}
        viewOnly={true}
      />
    );
  }

  return (
    <OutlineContent
      outline={outline}
      units={outline.units}
      finalAssessments={outline.finalAssessments}
      totalHours={outline.totalHours}
      viewOnly={true}
    />
  );
}
