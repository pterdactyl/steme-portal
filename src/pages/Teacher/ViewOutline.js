import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import OutlineContent from "./OutlineContent";

export default function ViewOutline() {
  const { courseCode } = useParams();  // ✅ use courseCode, not courseId

  const [outline, setOutline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseCode) {
      setError("No course code provided in URL.");
      setLoading(false);
      return;
    }

    const fetchOutline = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/view-outline/${courseCode}`);
        if (!response.ok) throw new Error("Failed to fetch outline");
        const data = await response.json();
        setOutline(data);
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
      units={outline.units || []}
      finalAssessments={outline.finalAssessments || []}
      totalHours={outline.totalHours || 0}
      viewOnly={true}
    />
  );
}
