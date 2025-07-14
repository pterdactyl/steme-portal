import React, { useState, useEffect, useContext } from "react";
import { useParams, useLocation } from "react-router-dom";
import '../../styles/EditOutline.css';
import OutlineContent from "./OutlineContent";
import { AuthContext } from "../../Auth/AuthContext";

export default function EditOutline() {
  const { courseId } = useParams();
  const { userId } = useContext(AuthContext); 

  const location = useLocation(); 
  const courseFromState = location.state?.course;
  const [viewMode, setViewMode] = useState("draft"); // "draft" or "published"
  const [isLoading, setIsLoading] = useState(false);

  const [outline, setOutline] = useState({
    courseCode: "",
    courseId: courseId  || "",
    courseName: "",
    grade: "",
    courseType: "",
    credit: "",
    description: "",
    learningGoals: "",
    assessment: "",
  });

  const [units, setUnits] = useState([{ unitNum: "", unitDescription: "", unitHours: "" }]);
  const [finalAssessments, setFinalAssessments] = useState([
    { description: "Independent Study Unit", hours: "" },
    { description: "Final Exam", hours: "" },
  ]);



  useEffect(() => {
    async function fetchOutline() {
      if (!courseId || !userId) return;
      setIsLoading(true);
      try {
        const endpoint =
          viewMode === "draft"
            ? `http://localhost:4000/api/outlines/${courseId}/draft?teacherId=${userId}`
            : `http://localhost:4000/api/outlines/${courseId}`;
  
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error("Failed to load outline");
  
        const data = await res.json();
        setOutline({
          courseId,
          courseCode: courseFromState?.course_code || "",
          courseName: data.course_name || "",
          grade: data.grade || "",
          courseType: data.course_type || "",
          credit: data.credit || "",
          description: data.description || "",
          learningGoals: data.learning_goals || "",
          assessment: data.assessment || "",
        });
        setUnits(data.units || []);
        setFinalAssessments(data.final_assessments || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }
  
    fetchOutline();
  }, [courseId, userId, viewMode]);

  useEffect(() => {
    const textareas = document.querySelectorAll("textarea");
    textareas.forEach((ta) => {
      ta.style.height = "auto";
      ta.style.height = `${ta.scrollHeight}px`;
    });
  }, [outline, units]);

  const handleChange = (key, value) => {
    setOutline((prev) => ({ ...prev, [key]: value }));
  };

  const addUnit = () => {
    setUnits([...units, { unitNum: "", unitDescription: "", unitHours: "" }]);
  };

  const removeUnit = (index) => {
    setUnits(units.filter((_, i) => i !== index));
  };

  const updateUnit = (index, field, value) => {
    const newUnits = [...units];
    newUnits[index][field] = value;
    setUnits(newUnits);
  };

  const updateFinalAssessment = (index, value) => {
    const newFinals = [...finalAssessments];
    newFinals[index].hours = value;
    setFinalAssessments(newFinals);
  };

  const totalHours =
    units.reduce((sum, unit) => sum + (parseFloat(unit.unitHours) || 0), 0) +
    finalAssessments.reduce((sum, f) => sum + (parseFloat(f.hours) || 0), 0);

    const handleSaveDraft = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/outlines/${courseId}/draft`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            course_name: outline.courseName,
            grade: outline.grade,
            course_type: outline.courseType,
            credit: outline.credit,
            description: outline.description,
            learning_goals: outline.learningGoals,
            assessment: outline.assessment,
            units,
            final_assessments: finalAssessments,
            total_hours: totalHours,
            updated_by: userId,
            course_code: courseFromState?.course_code
          }),
        });
    
        if (!response.ok) throw new Error("Failed to save draft");
        alert("Draft saved!");
      } catch (err) {
        console.error(err);
        alert("Failed to save draft");
      }
    };

  const handlePublish = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/outlines/${courseId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_name: outline.courseName,
          grade: outline.grade,
          course_type: outline.courseType,
          credit: outline.credit,
          description: outline.description,
          learning_goals: outline.learningGoals,
          assessment: outline.assessment,
          units: units,
          final_assessments: finalAssessments,
          total_hours: totalHours,
          updated_by: userId,
          course_code: courseFromState?.course_code
        }),
      });
  
      if (!response.ok) throw new Error("Failed to save outline to Azure");
  
      alert("Outline saved to Azure!");
    } catch (error) {
      console.error("Azure Save Error:", error);
      alert(`Failed to save to Azure: ${error.message}`);
    }
  };
  
  return (
    <div>
      <div style={{ textAlign: "center", margin: "30px 0" }}>
        <button
          onClick={() => setViewMode("draft")}
          disabled={viewMode === "draft"}
          className={`outline-btn toggle-btn ${viewMode === "draft" ? "active" : ""}`}
        >
          Edit My Draft
        </button>
        <button
          onClick={() => setViewMode("published")}
          disabled={viewMode === "published"}
          className={`outline-btn toggle-btn ${viewMode === "published" ? "active" : ""}`}
        >
          Edit Latest Version
        </button>
      </div>

      <OutlineContent
        outline={outline}
        units={units}
        finalAssessments={finalAssessments}
        totalHours={totalHours}
        viewOnly={false}
        handleChange={handleChange}
        updateUnit={updateUnit}
        updateFinalAssessment={updateFinalAssessment}
        addUnit={addUnit}
        removeUnit={removeUnit}
      />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: 20, textAlign: "center" }}>
        <button onClick={handleSaveDraft} className="outline-btn save-btn">
          Save Draft (locally)
        </button>
        <button onClick={handlePublish} className="outline-btn publish-btn">
          Publish Changes
        </button>
      </div>
    </div>
  );
}
