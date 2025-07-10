// src/pages/Teacher/ViewOutline.jsx 
import React, { useEffect, useState } from "react";
import { db } from "../../Auth/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import OutlineContent from "./OutlineContent";

export default function ViewOutline() {
  const { courseId } = useParams();

  const [outline, setOutline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId) {
      setError("No course ID provided in URL.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const docRef = doc(db, "courseOutlines", courseId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setOutline({ ...docSnap.data(), courseId: courseId }); 
        } else {
          setOutline(null);
        }
      } catch (err) {
        console.error("Firebase fetch error:", err);
        setError("Failed to load course data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>Error: {error}</div>;
  }

  if (!outline) {
    const blankOutline = {
      courseId: courseId, courseName: "No Outline Found", grade: "", courseType: "",
      credit: "", description: "", learningGoals: "", assessment: "",
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