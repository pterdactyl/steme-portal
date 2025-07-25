// src/pages/Teacher/OutlineContent.jsx 
import React from "react";
import '../../styles/EditOutline.css';

export default function OutlineContent({
  outline,
  units,
  finalAssessments,
  totalHours,
  viewOnly,
  handleChange,
  updateUnit,
  updateFinalAssessment,
  addUnit,
  removeUnit,
}) {
  return (
    <div style={{ maxWidth: 900, margin: "20px auto", padding: 20 }}>
      <h2 style={{ textAlign: "center" }}>Course Outline ({outline.courseCode})</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20, tableLayout: "fixed"}}>
        <tbody>
          <tr>
            <td className="leftSide">Course Name</td>
            <td className="cellStyle">
              {viewOnly ? (
                <div className="view-text-style">{outline.courseName}</div>
              ) : (
                <input
                  type="text"
                  value={outline.courseName}
                  onChange={(e) => handleChange("courseName", e.target.value)}
                  className="inputStyle"
                />
              )}
            </td>
          </tr>
          <tr>
            <td className="leftSide"><strong>Grade</strong></td>
            <td className="cellStyle">
              {viewOnly ? (
                <div className="view-text-style">{outline.grade}</div>
              ) : (
                <input
                  type="text"
                  value={outline.grade}
                  onChange={(e) => handleChange("grade", e.target.value)}
                  className="inputStyle"
                />
              )}
            </td>
          </tr>
          <tr>
            <td className="leftSide"><strong>Course Type</strong></td>
            <td className="cellStyle">
              {viewOnly ? (
                <div className="view-text-style">{outline.courseType}</div>
              ) : (
                <input
                  type="text"
                  value={outline.courseType}
                  onChange={(e) => handleChange("courseType", e.target.value)}
                  className="inputStyle"
                />
              )}
            </td>
          </tr>
          <tr>
            <td className="leftSide"><strong>Credit Value</strong></td>
            <td className="cellStyle">
              {viewOnly ? (
                <div className="view-text-style">{outline.credit}</div>
              ) : (
                <input
                  type="text"
                  value={outline.credit}
                  onChange={(e) => handleChange("credit", e.target.value)}
                  className="inputStyle"
                />
              )}
            </td>
          </tr>
         {/* NEW Prerequisites row */}
<tr>
  <td className="leftSide"><strong>Prerequisite(s)</strong></td>
  <td className="cellStyle">
    {viewOnly ? (
      <div className="view-text-style">
        {outline.prerequisite && outline.prerequisite.trim() !== "" 
          ? outline.prerequisite 
          : "None"}
      </div>
    ) : (
      <input
        type="text"
        value={outline.prerequisite && outline.prerequisite.trim() !== "" 
          ? outline.prerequisite 
          : "None"}
        onChange={(e) => handleChange("prerequisite", e.target.value)}  // fixed key here
        className="inputStyle"
        placeholder="None"
      />
    )}
  </td>
</tr>
          <tr>
            <td className="leftSide"><strong>Description</strong></td>
            <td className="cellStyle">
              {viewOnly ? (
                <div className="view-textarea-style">{outline.description}</div>
              ) : (
                <textarea
                  value={outline.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = `${e.target.scrollHeight}px`; }}
                  className="textareaStyle"
                />
              )}
            </td>
          </tr>
          <tr>
            <td className="leftSide"><strong>Learning Goals</strong></td>
            <td className="cellStyle">
              {viewOnly ? (
                <div className="view-textarea-style">{outline.learningGoals}</div>
              ) : (
                <textarea
                  value={outline.learningGoals}
                  onChange={(e) => handleChange("learningGoals", e.target.value)}
                  onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = `${e.target.scrollHeight}px`; }}
                  className="textareaStyle"
                />
              )}
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
                    {!viewOnly && <td className="subHeaderStyle subHeaderWidth10">Actions</td>}
                  </tr>
                </thead>
                <tbody>
                  {units.map((unit, index) => (
                    <tr key={index}>
                      <td className="unitColumn">{viewOnly ? unit.unitNum : <input type="text" value={unit.unitNum} onChange={(e) => updateUnit(index, "unitNum", e.target.value)} className="inputStyle" />}</td>
                      <td className="descriptionColumn">{viewOnly ? <div className="view-textarea-style">{unit.unitDescription}</div> : <textarea value={unit.unitDescription} onChange={(e) => updateUnit(index, "unitDescription", e.target.value)} className="unitDescription" />}</td>
                      <td className="hoursColumn">{viewOnly ? unit.unitHours : <input type="number" value={unit.unitHours} onChange={(e) => updateUnit(index, "unitHours", e.target.value)} className="inputHours" />}</td>
                      {!viewOnly && (<td className="actionColumn"><button onClick={() => removeUnit(index)}>Remove</button></td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
              {!viewOnly && <button onClick={addUnit} style={{ marginTop: "8px" }}>Add Unit</button>}

              <h4 style={{ marginTop: "10px", fontSize: "14px" }}>Final Assessment</h4>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
                <tbody>
                  {finalAssessments.map((item, index) => (
                    <tr key={index}>
                      <td style={{ border: "1px solid #ccc", padding: "6px", fontSize: "12px" }}>{item.description}</td>
                      <td className="hoursColumn">{viewOnly ? item.hours : <input type="number" value={item.hours} onChange={(e) => updateFinalAssessment(index, e.target.value)} className="inputHours" />}</td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{ border: "1px solid #ccc", padding: "6px", fontSize: "12px" }}>Total Hours</td>
                    <td className="hoursColumn">{viewOnly ? totalHours : <input type="text" value={totalHours} readOnly className="inputHours inputHoursReadonly" />}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          <tr>
            <td className="leftSide"><strong>Assessment</strong></td>
            <td className="cellStyle">
              {(() => {
                let parsed = { term: 0, final: 0, categories: {} };
                try {
                  parsed = typeof outline.assessment === "string" && outline.assessment.trim() !== ""
                    ? JSON.parse(outline.assessment)
                    : outline.assessment || parsed;
                } catch {
                  return <div style={{ color: "red" }}>Invalid assessment data</div>;
                }

                const updateField = (field, value) => {
                  const updated = { ...parsed };
                  if (field === "term" || field === "final") {
                    updated[field] = Number(value) || 0;
                  }
                  handleChange("assessment", JSON.stringify(updated));
                };

                const updateCategory = (key, value) => {
                  const updated = { ...parsed };
                  updated.categories = { ...updated.categories, [key]: Number(value) || 0 };
                  handleChange("assessment", JSON.stringify(updated));
                };

                if (viewOnly) {
                  return (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                      <tbody>
                        <tr>
                          <td style={{ fontWeight: "bold", borderBottom: "1px solid #ccc" }}>Term Work</td>
                          <td style={{ borderBottom: "1px solid #ccc" }}>{parsed.term}%</td>
                        </tr>
                        {parsed.categories &&
                          Object.entries(parsed.categories).map(([key, val]) => (
                            <tr key={key}>
                              <td style={{ paddingLeft: "2rem" }}>• {key}</td>
                              <td>{val}%</td>
                            </tr>
                          ))}
                        <tr>
                          <td style={{ fontWeight: "bold", borderTop: "1px solid #ccc" }}>Final Evaluation</td>
                          <td style={{ borderTop: "1px solid #ccc" }}>{parsed.final}%</td>
                        </tr>
                      </tbody>
                    </table>
                  );
                }

                return (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                    <tbody>
                      <tr>
                        <td style={{ fontWeight: "bold", borderBottom: "1px solid #ccc" }}>Term Work</td>
                        <td style={{ borderBottom: "1px solid #ccc" }}>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={parsed.term}
                            onChange={e => updateField("term", e.target.value)}
                            style={{ width: "60px" }}
                          />%
                        </td>
                      </tr>
                      {parsed.categories &&
                        Object.entries(parsed.categories).map(([key, val]) => (
                          <tr key={key}>
                            <td style={{ paddingLeft: "2rem" }}>• {key}</td>
                            <td>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={val}
                                onChange={e => updateCategory(key, e.target.value)}
                                style={{ width: "60px" }}
                              />%
                            </td>
                          </tr>
                        ))}
                      <tr>
                        <td style={{ fontWeight: "bold", borderTop: "1px solid #ccc" }}>Final Evaluation</td>
                        <td style={{ borderTop: "1px solid #ccc" }}>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={parsed.final}
                            onChange={e => updateField("final", e.target.value)}
                            style={{ width: "60px" }}
                          />%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                );
              })()}
            </td>
          </tr>

        </tbody>
      </table>
    </div>
  );
}