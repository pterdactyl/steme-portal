import React, { useState, useEffect } from "react";
import { db } from "../Auth/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function EditOutline() {
  const [outline, setOutline] = useState({
    courseCode: "",
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
    const savedOutline = localStorage.getItem("courseOutline");
    const savedUnits = localStorage.getItem("courseOutlineUnits");
    const savedFinals = localStorage.getItem("courseOutlineFinalAssessments");
    if (savedOutline) setOutline(JSON.parse(savedOutline));
    if (savedUnits) setUnits(JSON.parse(savedUnits));
    if (savedFinals) setFinalAssessments(JSON.parse(savedFinals));
  }, []);

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

  const handleSaveLocal = () => {
    localStorage.setItem("courseOutline", JSON.stringify(outline));
    localStorage.setItem("courseOutlineUnits", JSON.stringify(units));
    localStorage.setItem("courseOutlineFinalAssessments", JSON.stringify(finalAssessments));
    localStorage.setItem("courseOutlineTotalHours", totalHours);
    alert("Saved locally!");
  };

  const handleSaveToFirestore = async () => {
    try {
      const docRef = doc(db, "courseOutlines", outline.courseCode || "defaultCode");
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

  const totalHours =
    units.reduce((sum, unit) => sum + (parseFloat(unit.unitHours) || 0), 0) +
    finalAssessments.reduce((sum, f) => sum + (parseFloat(f.hours) || 0), 0);

  return (
    <div style={{ maxWidth: 900, margin: "20px auto", padding: 20 }}>
      <h2 style={{ textAlign: "center" }}>Course Outline</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
        <tbody>
          <tr>
            <td style={leftSide}><strong>Course Name</strong></td>
            <td style={cellStyle}>
              <input
                type="text"
                value={outline.courseName}
                onChange={(e) => handleChange("courseName", e.target.value)}
                style={inputStyle}
              />
            </td>
          </tr>
          <tr>
            <td style={leftSide}><strong>Course Code</strong></td>
            <td style={cellStyle}>
              <input
                type="text"
                value={outline.courseCode}
                onChange={(e) => handleChange("courseCode", e.target.value)}
                style={inputStyle}
              />
            </td>
          </tr>
          <tr>
            <td style={leftSide}><strong>Grade</strong></td>
            <td style={cellStyle}>
              <input
                type="text"
                value={outline.grade}
                onChange={(e) => handleChange("grade", e.target.value)}
                style={inputStyle}
              />
            </td>
          </tr>
          <tr>
            <td style={leftSide}><strong>Course Type</strong></td>
            <td style={cellStyle}>
              <input
                type="text"
                value={outline.courseType}
                onChange={(e) => handleChange("courseType", e.target.value)}
                style={inputStyle}
              />
            </td>
          </tr>
          <tr>
            <td style={leftSide}><strong>Credit Value</strong></td>
            <td style={cellStyle}>
              <input
                type="text"
                value={outline.credit}
                onChange={(e) => handleChange("credit", e.target.value)}
                style={inputStyle}
              />
            </td>
          </tr>
          <tr>
            <td style={leftSide}><strong>Description</strong></td>
            <td style={cellStyle}>
              <textarea
                value={outline.description}
                onChange={(e) => handleChange("description", e.target.value)}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                style={textareaStyle}
              />
            </td>
          </tr>
          <tr>
            <td style={leftSide}><strong>Learning Goals</strong></td>
            <td style={cellStyle}>
              <textarea
                value={outline.learningGoals}
                onChange={(e) => handleChange("learningGoals", e.target.value)}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                style={textareaStyle}
              />
            </td>
          </tr>
          <tr>
            <td style={leftSide}><strong>Units</strong></td>
            <td style={cellStyle}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <td style={{ ...subHeaderStyle, width: "10%" }}>Unit</td>
                    <td style={{ ...subHeaderStyle, width: "60%" }}>Description</td>
                    <td style={{ ...subHeaderStyle, width: "20%" }}>Hours</td>
                    <td style={{ ...subHeaderStyle, width: "10%" }}>Actions</td>
                  </tr>
                </thead>
                <tbody>
                  {units.map((unit, index) => (
                    <tr key={index}>
                      <td style={unitColumn}>
                        <input
                          type="text"
                          value={unit.unitNum}
                          onChange={(e) => updateUnit(index, "unitNum", e.target.value)}
                          style={inputStyle}
                        />
                      </td>
                      <td style={descriptionColumn}>
                        <textarea
                          value={unit.unitDescription}
                          onChange={(e) => updateUnit(index, "unitDescription", e.target.value)}
                          style={unitDescription}
                        />
                      </td>
                      <td style={hoursColumn}>
                        <input
                          type="number"
                          value={unit.unitHours}
                          onChange={(e) => updateUnit(index, "unitHours", e.target.value)}
                          style={inputHours}
                        />
                      </td>
                      <td style={actionColumn}>
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
                      <td style={hoursColumn}>
                        <input
                          type="number"
                          value={item.hours}
                          onChange={(e) => updateFinalAssessment(index, e.target.value)}
                          style={inputHours}
                        />
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{ border: "1px solid #ccc", padding: "6px", fontSize: "12px" }}>Total Hours</td>
                    <td style={hoursColumn}>
                      <input type="text" value={totalHours} readOnly style={{ ...inputHours, backgroundColor: "#eee" }} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td style={leftSide}><strong>Assessment</strong></td>
            <td style={cellStyle}>
              <textarea
                value={outline.assessment}
                onChange={(e) => handleChange("assessment", e.target.value)}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                style={textareaStyle}
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

// Styles
const cellStyle = {
  border: "1px solid #000000",
  padding: "8px",
  verticalAlign: "top",
};

const leftSide = {
  ...cellStyle,
  width: "200px",
  fontWeight: "bold",
};

const inputStyle = {
  width: "100%",
  padding: "6px",
  fontSize: "12px",
  border: "none",
};

const inputHours = {
  width: "100%",
  padding: "6px",
  fontSize: "12px",
  border: "1px solid #ccc",
};

const textareaStyle = {
  width: "100%",
  minHeight: "100px",
  padding: "8px",
  fontSize: "14px",
  resize: "none",
  border: "none",
  outline: "none",
  overflow: "hidden",
  backgroundColor: "transparent",
};

const subHeaderStyle = {
  border: "1px solid #ccc",
  padding: "6px",
  backgroundColor: "#ADDFFF",
  fontSize: "12px",
};

const unitColumn = {
  border: "1px solid #ccc",
  padding: "6px",
};

const descriptionColumn = {
  border: "1px solid #ccc",
  padding: "6px",
};

const unitDescription = {
  width: "100%",
  padding: "6px",
  fontSize: "12px",
  resize: "none",
  border: "none",
};

const hoursColumn = {
  border: "1px solid #ccc",
  padding: "6px",
  width: "20%",
};

const actionColumn = {
  border: "1px solid #ccc",
  padding: "6px",
};
