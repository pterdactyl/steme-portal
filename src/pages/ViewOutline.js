import React, { useEffect, useState } from "react";
import { db } from "../Auth/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import OutlineContent from "./OutlineContent";

export default function ViewOutline() {
  const { courseCode } = useParams();
  const [outline, setOutline] = useState({
    courseCode: courseCode || "",
    courseName: "",
    grade: "",
    courseType: "",
    credit: "",
    description: "",
    learningGoals: "",
    assessment: "",
  });
  const [units, setUnits] = useState([]);
  const [finalAssessments, setFinalAssessments] = useState([]);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "courseOutlines", courseCode);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setOutline({
          ...data,
          courseCode: courseCode,
        });
        setUnits(data.units || []);
        setFinalAssessments(data.finalAssessments || []);
        setTotalHours(data.totalHours || 0);
      } else {
        alert("Outline not found!");
      }
    };
    fetchData();
  }, [courseCode]);

  if (!outline.courseName) return <div>Loading...</div>;

  return (
    <OutlineContent
      outline={outline}
      units={units}
      finalAssessments={finalAssessments}
      totalHours={totalHours}
      viewOnly={true}
    />
  );
}
