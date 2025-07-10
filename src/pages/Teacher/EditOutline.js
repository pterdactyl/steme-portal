import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import '../../styles/EditOutline.css';
import OutlineContent from "./OutlineContent";
import { AuthContext } from "../../Auth/AuthContext";

export default function EditOutline() {
  const { courseId } = useParams();
  const { userId } = useContext(AuthContext); 

  const [outline, setOutline] = useState({
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

  const localOutlineKey = `courseOutline_${courseId }`;
  const localUnitsKey = `courseOutlineUnits_${courseId }`;
  const localFinalsKey = `courseOutlineFinalAssessments_${courseId }`;
  const localTotalHoursKey = `courseOutlineTotalHours_${courseId }`;

  useEffect(() => {
    const savedOutline = localStorage.getItem(localOutlineKey);
    const savedUnits = localStorage.getItem(localUnitsKey);
    const savedFinals = localStorage.getItem(localFinalsKey);
    if (savedOutline) setOutline(JSON.parse(savedOutline));
    if (savedUnits) setUnits(JSON.parse(savedUnits));
    if (savedFinals) setFinalAssessments(JSON.parse(savedFinals));
  }, [localOutlineKey, localUnitsKey, localFinalsKey]);

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

  const handleSaveLocal = () => {
    localStorage.setItem(localOutlineKey, JSON.stringify(outline));
    localStorage.setItem(localUnitsKey, JSON.stringify(units));
    localStorage.setItem(localFinalsKey, JSON.stringify(finalAssessments));
    localStorage.setItem(localTotalHoursKey, totalHours);
    alert("Saved locally!");
  };

  const handleSaveToAzure = async () => {
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

      <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
        <button onClick={handleSaveToAzure} style={{ padding: "10px 20px", marginRight: 10 }}>
          Save Changes
        </button>
        <button onClick={handleSaveLocal} style={{ padding: "10px 20px" }}>
          Publish Changes (click when finished editing)
        </button>
      </div>
    </div>
  );
}
