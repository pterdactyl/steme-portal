import React, { useState, useEffect } from "react";
import { db } from "../../Auth/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import '../styles/EditOutline.css';

export default function EditOutline() {
  const { courseId  } = useParams();
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
    const savedOutline = localStorage.getItem(`courseOutline_${courseId }`);
    const savedUnits = localStorage.getItem(`courseOutlineUnits_${courseId }`);
    const savedFinals = localStorage.getItem(`courseOutlineFinalAssessments_${courseId }`);
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
    localStorage.setItem(`courseOutline_${courseId }`, JSON.stringify(outline));
    localStorage.setItem(`courseOutlineUnits_${courseId }`, JSON.stringify(units));
    localStorage.setItem(`courseOutlineFinalAssessments_${courseId }`, JSON.stringify(finalAssessments));
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
    <div style={{ maxWidth: 900, margin: "20px auto", padding: 20 }}>
      <h2 style={{ textAlign: "center" }}>Course Outline ({courseId })</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
        <tbody>
          <tr>
            <td className="leftSide"><strong>Course Name</strong></td>
            <td className="cellStyle">
              <input
                type="text"
                value={outline.courseName}
                onChange={(e) => handleChange("courseName", e.target.value)}
                className="inputStyle"
              />
            </td>
          </tr>
          <tr>
            <td className="leftSide"><strong>Grade</strong></td>
            <td className="cellStyle">
              <input
                type="text"
                value={outline.grade}
                onChange={(e) => handleChange("grade", e.target.value)}
                className="inputStyle"
              />
            </td>
          </tr>
          <tr>
            <td className="leftSide"><strong>Course Type</strong></td>
            <td className="cellStyle">
              <input
                type="text"
                value={outline.courseType}
                onChange={(e) => handleChange("courseType", e.target.value)}
                className="inputStyle"
              />
            </td>
          </tr>
          <tr>
            <td className="leftSide"><strong>Credit Value</strong></td>
            <td className="cellStyle">
              <input
                type="text"
                value={outline.credit}
                onChange={(e) => handleChange("credit", e.target.value)}
                className="inputStyle"
              />
            </td>
          </tr>
          <tr>
            <td className="leftSide"><strong>Description</strong></td>
            <td className="cellStyle">
              <textarea
                value={outline.description}
                onChange={(e) => handleChange("description", e.target.value)}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                className="textareaStyle"
              />
            </td>
          </tr>
          <tr>
            <td className="leftSide"><strong>Learning Goals</strong></td>
            <td className="cellStyle">
              <textarea
                value={outline.learningGoals}
                onChange={(e) => handleChange("learningGoals", e.target.value)}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                className="textareaStyle"
              />
            </td>
          </tr>
          <tr>
            <td className="leftSide"><strong>Units</strong></td>
            <td className="cellStyle">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <td className="subHeaderStyle subHeaderWidth10">Unit</td>
                    <td className="subHeaderStyle subHeaderWidth60">Description</td>
                    <td className="subHeaderStyle subHeaderWidth20">Hours</td>
                    <td className="subHeaderStyle subHeaderWidth10">Actions</td>
                  </tr>
                </thead>
                <tbody>
                  {units.map((unit, index) => (
                    <tr key={index}>
                      <td className="unitColumn">
                        <input
                          type="text"
                          value={unit.unitNum}
                          onChange={(e) => updateUnit(index, "unitNum", e.target.value)}
                          className="inputStyle"
                        />
                      </td>
                      <td className="descriptionColumn">
                        <textarea
                          value={unit.unitDescription}
                          onChange={(e) => updateUnit(index, "unitDescription", e.target.value)}
                          className="unitDescription"
                        />
                      </td>
                      <td className="hoursColumn">
                        <input
                          type="number"
                          value={unit.unitHours}
                          onChange={(e) => updateUnit(index, "unitHours", e.target.value)}
                          className="inputHours"
                        />
                      </td>
                      <td className="actionColumn">
                        <button onClick={() => removeUnit(index)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={addUnit} style={{ marginTop: "8px" }}>Add Unit</button>

              <h4 style={{ marginTop: "10px", fontSize: "14px" }}>Final Assessment</h4>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
                <tbody>
                  {finalAssessments.map((item, index) => (
                    <tr key={index}>
                      <td style={{ border: "1px solid #ccc", padding: "6px", fontSize: "12px" }}>
                        {item.description}
                      </td>
                      <td className="hoursColumn">
                        <input
                          type="number"
                          value={item.hours}
                          onChange={(e) => updateFinalAssessment(index, e.target.value)}
                          className="inputHours"
                        />
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{ border: "1px solid #ccc", padding: "6px", fontSize: "12px" }}>Total Hours</td>
                    <td className="hoursColumn">
                      <input
                        type="text"
                        value={totalHours}
                        readOnly
                        className="inputHours inputHoursReadonly"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td className="leftSide"><strong>Assessment</strong></td>
            <td className="cellStyle">
              <textarea
                value={outline.assessment}
                onChange={(e) => handleChange("assessment", e.target.value)}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                className="textareaStyle"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: 20 }}>
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