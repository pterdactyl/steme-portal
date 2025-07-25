import React, { useState, useEffect, useContext } from "react";
import { useParams, useLocation } from "react-router-dom";
import '../../styles/EditOutline.css';
import OutlineContent from "./OutlineContent";
import { AuthContext } from "../../Auth/AuthContext";
import CustomSnackbar from '../../components/CustomSnackbar';

export default function EditOutline() {
  const { courseId } = useParams();
  const { userId } = useContext(AuthContext);

  const location = useLocation(); 
  const courseFromState = location.state?.course;
  const [viewMode, setViewMode] = useState("draft"); // "draft" or "published"
  const [isLoading, setIsLoading] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const [snackbarSeverity, setSnackbarSeverity] = React.useState("info");

  const showSnackbar = (message, severity = "info") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

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
    prerequisite: "",
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
  
      const draftEndpoint = `${process.env.REACT_APP_API_URL}/outlines/${courseId}/draft?teacherId=${userId}`;
      const publishedEndpoint = `${process.env.REACT_APP_API_URL}/outlines/${courseId}`;
  
      try {
        let res;
        if (viewMode === "draft") {
          // Try to fetch draft first
          res = await fetch(draftEndpoint);
          if (!res.ok) {
            // If draft fetch fails, fallback to published version
            console.warn("Draft fetch failed, loading published version instead.");
            showSnackbar("Draft not found, loading published version.", "warning");
            res = await fetch(publishedEndpoint);
            if (!res.ok) {
              throw new Error("Failed to load published outline fallback");
              showSnackbar("Loaded published version as fallback.", "info");
            }
          }
        } else {
          // If viewMode is published, fetch published directly
          res = await fetch(publishedEndpoint);
          if (!res.ok) {
            throw new Error("Failed to load outline");
            showSnackbar("Failed to load published outline.", "error");
          }
        }
  
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
          prerequisite: data.prerequisite || "",
        });
        setUnits(data.units || []);
        setFinalAssessments(data.final_assessments || []);
      } catch (err) {
        showSnackbar("Failed to load outline data.", "error");
        // Optionally reset or show fallback UI here
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
        const response = await fetch(`${process.env.REACT_APP_API_URL}/outlines/${courseId}/draft`, {
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
            course_code: courseFromState?.course_code,
            prerequisite: outline.prerequisite,
          }),
        });
    
        if (!response.ok) throw new Error("Failed to save draft");
        showSnackbar("Draft saved!", "success");
      } catch (err) {
        console.error(err);
        showSnackbar("Failed to save draft", "error"); 
      }
    };

  const handlePublish = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/outlines/${courseId}`, {
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
          course_code: courseFromState?.course_code,
          prerequisite: outline.prerequisite,
        }),
      });

      if (response.ok) {
        const data = await response.json().catch(() => null);
        console.log("Azure Save Success:", data);
        showSnackbar("Published Outline!", "success");
      } else {
        const errorText = await response.text();
        throw new Error(`Azure responded with ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error("Azure Save Error:", error);
      showSnackbar(`Failed to publish outline: ${error.message}`, "error");
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
      <CustomSnackbar
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        severity={snackbarSeverity}
        message={snackbarMessage}
      />
    </div>
  );
}
