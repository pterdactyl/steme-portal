import React, { useState, useEffect } from "react";
import { db } from "../../Auth/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import '../../styles/EditOutline.css';
import OutlineContent from "./OutlineContent";

export default function EditOutline() {
  const { courseId } = useParams();

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

  const handleSaveToFirestore = async () => {
    try {
      const docRef = doc(db, "courseOutlines", courseId  || "defaultCode");
      await setDoc(docRef, {
        ...outline,
        units,
        finalAssessments,
        totalHours,
        timestamp: new Date(),
      });
      alert("Saved to Firestore!");
    } catch (error) {
      console.error("Firestore Save Error:", error.code, error.message);
      alert(`Failed to save: ${error.message}`);
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
        <button onClick={handleSaveToFirestore} style={{ padding: "10px 20px", marginRight: 10 }}>
          Save to Firestore
        </button>
        <button onClick={handleSaveLocal} style={{ padding: "10px 20px" }}>
          Save Locally
        </button>
      </div>
    </div>
  );
}
