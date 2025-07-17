import React, { useState, useEffect, useContext } from "react";
import "./CourseSelection.css";
import CourseModal from "../../components/CourseModal";
import { AuthContext } from "../../Auth/AuthContext";
import { courseDescriptions } from "./CourseDescriptions";
import CourseDetailModal from "./CourseDetailModal"

const gradeLevels = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];
const currentGrade = "Grade 9";

const artsCourses = [
  { id: "AMU1O", title: "Grade 9 Music, Open", code: "AMU1O", credits: 1, group: "arts" },
  { id: "AVI1O", title: "Grade 9 Visual Arts, Open", code: "AVI1O", credits: 1, group: "arts" },
  { id: "AMU2O", title: "Grade 10 Music, Open", code: "AMU2O", credits: 1, group: "arts" },
];

const availableCourses = [
  ...artsCourses,
  { id: "BEM1O", title: "Grade 9 Business - Building the Entrepreneurial Mindset, Open", code: "BEM1O", credits: 1, prerequisite: null },
  { id: "TAS1O", title: "Grade 9 Technology and the Skilled Trades, Open", code: "TAS1O", credits: 1, prerequisite: null },
  { id: "BEP2O", title: "Grade 10 Business, Launching and Leading a Business, Open", code: "BEP2O", credits: 1, prerequisite: null },
  { id: "TAS2O", title: "Grade 10 Technology and the Skilled Trades, Open", code: "TAS2O", credits: 1, prerequisite: null },
  { id: "LKBBD", title: "Grade 10 International Languages (Simplified Chinese), Academic", code: "LKBBD", credits: 1, prerequisite: null },
  { id: "SPH3U", title: "Grade 11 Physics, University", code: "SPH3U", credits: 1, prerequisite: "SNC2D" },
  { id: "SBI3U", title: "Grade 11 Biology, University", code: "SBI3U", credits: 1, prerequisite: "SNC2D" },
  { id: "SCH3U", title: "Grade 11 Chemistry, University", code: "SCH3U", credits: 1, prerequisite: "SNC2D" },
  { id: "BDI3C", title: "Grade 11 Business, Entrepreneurship: The Venture, College", code: "BDI3C", credits: 1, prerequisite: null },
  { id: "BAF3M", title: "Grade 11 Business, Financial Accounting Fundamentals, University/College", code: "BAF3M", credits: 1, prerequisite: null },
  { id: "ISC3U", title: "Grade 11 Computer Science, University", code: "ISC3U", credits: 1, prerequisite: null },
  { id: "ISC4U", title: "Grade 12 Computer Science, University", code: "ISC4U", credits: 1, prerequisite: "ISC3U" },
  { id: "TGJ3M", title: "Grade 11 Communications Technology, University/College", code: "TGJ3M", credits: 1, prerequisite: null },
  { id: "LKBCU", title: "Grade 11 International Languages (Simplified Chinese), Academic", code: "LKBCU", credits: 1, prerequisite: "LKBBD" },
  { id: "IDC3O", title: "Grade 11 Interdisciplinary Studies (International Travel), Open", code: "IDC3O", credits: 1, prerequisite: null },
  { id: "SPH4U", title: "Grade 12 Physics, University", code: "SPH4U", credits: 1, prerequisite: "SPH3U" },
  { id: "SBI4U", title: "Grade 12 Biology, University", code: "SBI4U", credits: 1, prerequisite: "SBI3U" },
  { id: "SCH4U", title: "Grade 12 Chemistry, University", code: "SCH4U", credits: 1, prerequisite: "SCH3U" },
  { id: "TGJ4M", title: "Grade 12 Communications Technology, University/College", code: "TGJ4M", credits: 1, prerequisite: null },
  { id: "BOH4M", title: "Grade 12 Business Leadership: Management Fundamentals, University/College", code: "BOH4M", credits: 1, prerequisite: null },
  { id: "BDV4C", title: "Grade 12 Business Entrepreneurship: Venture Planning, College", code: "BDV4C", credits: 1, prerequisite: null },
  { id: "BBB4M", title: "Grade 12 International Business Fundamentals Fundamentals, University/College", code: "BBB4M", credits: 1, prerequisite: null },
  { id: "LKBDU", title: "Grade 12 International Languages (Simplified Chinese), Academic", code: "LKBDU", credits: 1, prerequisite: "LKBCU" },
  { id: "IDC4U", title: "Grade 12 Interdisciplinary Studies (International Travel), University", code: "IDC4U", credits: 1, prerequisite: null },
  { id: "IDC4O", title: "Grade 12 Interdisciplinary Studies (International Travel), University", code: "IDC4O", credits: 1, prerequisite: null },
];

const initialCourses = {
  "Grade 9": [
    { id: "ENG1D", title: "Grade 9 English, Academic", code: "ENG1D", required: true, credits: 1, prerequisite: null },
    { id: "MPM1D", title: "Grade 9 Mathematics, Academic", code: "MPM1D", required: true, credits: 1, prerequisite: null },
    { id: "SNC1D", title: "Grade 9 Science, Academic", code: "SNC1D", required: true, credits: 1, prerequisite: null },
    { id: "CGC1D", title: "Grade 9 Geography, Academic", code: "CGC1D", required: true, credits: 1, prerequisite: null },
    { id: "FSF1D", title: "Grade 9 French, Academic", code: "FSF1D", required: true, credits: 1, prerequisite: null },
  ],
  "Grade 10": [
    { id: "ENG2D", title: "Grade 10 English, Academic", code: "ENG2D", required: true, credits: 1, prerequisite: "ENG1D" },
    { id: "MPM2D", title: "Grade 10 Mathematics, Academic", code: "MPM2D", required: true, credits: 1, prerequisite: "MPM1D" },
    { id: "SNC2D", title: "Grade 10 Science, Academic", code: "SNC2D", required: true, credits: 1, prerequisite: "SNC1D" },
    { id: "CHC2D", title: "Grade 10 Canadian History since WWI, Academic", code: "CHC2D", required: true, credits: 1, prerequisite: null },
    { id: "GLC2O", title: "Grade 10 Career Studies, Open", code: "GLC2O", required: true, credits: 0.5, prerequisite: null },
    { id: "CHV2O", title: "Grade 10 Civics and Citizenship, Open", code: "CHV2O", required: true, credits: 0.5, prerequisite: null },
  ],
  "Grade 11": [
    { id: "ENG3U", title: "Grade 11 English, University", code: "ENG3U", required: true, credits: 1, prerequisite: "ENG2D" },
    { id: "MCR3U", title: "Grade 11 Math, Functions, University", code: "MCR3U", required: true, credits: 1, prerequisite: "MPM2D" },
  ],
  "Grade 12": [
    { id: "ENG4U", title: "Grade 12 English, University", code: "ENG4U", required: true, credits: 1, prerequisite: "ENG3U" },
    { id: "MHF4U", title: "Grade 12 Math, Advanced Functions", code: "MHF4U", required: true, credits: 1, prerequisite: "MCR3U" },
    { id: "MCV4U", title: "Grade 12 Math, Calculus and Vectors", code: "MCV4U", required: true, credits: 1, prerequisite: "MHF4U" },
  ],
};

export default function CourseSelection() {
  const { userId } = useContext(AuthContext);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState(null);
  
  const [courses, setCourses] = useState(initialCourses);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalGrade, setModalGrade] = useState(null);
  const [filterGroup, setFilterGroup] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Load saved courses on mount
//   useEffect(() => {
//   if (!user?.username) return;

//   const loadSavedCourses = async () => {
//     try {
//       const res = await fetch(
//   http://localhost:4000/api/courses?email=${encodeURIComponent(user.email)}&grade=${encodeURIComponent(currentGrade)}
// );
//       if (!res.ok) throw new Error("Failed to fetch courses");
//       const data = await res.json();

//       if (data?.courses) {
//         setCourses(prev => ({
//           ...prev,
//           [currentGrade]: data.courses,
//         }));
//         setHasSubmitted(true);
//       }
//     } catch (error) {
//       console.error("Error loading saved courses:", error);
//     }
//   };

//   loadSavedCourses();
// }, [user]);


  const handleAddCourse = (grade, group = null) => {
    if (gradeLevels.indexOf(grade) < gradeLevels.indexOf(currentGrade)) return;
    if (grade === currentGrade && hasSubmitted) return;
    setModalGrade(grade);
    setFilterGroup(group);
    setModalOpen(true);
  };

  const handleSelectCourse = (course) => {
  if (!modalGrade) return;

  // Check prerequisite if it exists
  if (course.prerequisite) {
    const allSelectedCourses = [];

    gradeLevels.forEach((grade) => {
      // Only consider grades before or equal to the current one
      if (gradeLevels.indexOf(grade) <= gradeLevels.indexOf(modalGrade)) {
        const gradeCourses = courses[grade] || [];
        gradeCourses.forEach(c => allSelectedCourses.push(c.code));
      }
    });

    if (!allSelectedCourses.includes(course.prerequisite)) {
      alert(`❌ You must complete ${course.prerequisite} before taking ${course.code}.`);
      return;
    }
  }

  setCourses(prev => {
    const existing = prev[modalGrade] || [];

    const filtered = course.group
      ? existing.filter(c => c.group !== course.group)
      : existing;

    return {
      ...prev,
      [modalGrade]: [...filtered, course],
    };
  });

  setModalOpen(false);
  setFilterGroup(null);
};

  const handleRemoveCourse = (grade, courseId) => {
    if (gradeLevels.indexOf(grade) < gradeLevels.indexOf(currentGrade)) return;
    if (grade === currentGrade && hasSubmitted) return;

    setCourses(prev => ({
      ...prev,
      [grade]: prev[grade].filter(c => c.id !== courseId),
    }));
  };

const handleSubmitCourses = async (grade) => {
  // if (!user?.username) {
  //   alert("❌ You must be logged in to submit courses.");
  //   return;
  // }

  console.log("Submitting courses:", {
  email: userId,
  grade,
  courses: courses[grade] || [],
});

  try {
    const response = await fetch("http://localhost:4000/api/courses/studentselections", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    id: userId,
    grade,
    courses: courses[grade] || [],
  }),
});

    if (!response.ok) throw new Error("Failed to save courses");

    alert(`✅ Courses submitted for ${grade}!`);
    setHasSubmitted(true);
  } catch (error) {
    console.error("Error saving courses:", error);
    alert("❌ Failed to save courses. Try again.");
  }
};

  const getCreditCounts = () => {
    let total = 0;
    let earned = 0; // You can customize earned logic
    let planned = 0;

    gradeLevels.forEach((grade) => {
      const list = courses[grade] || [];
      const credits = list.reduce((sum, c) => sum + (c.credits || 0), 0);
      total += credits;

      if (gradeLevels.indexOf(grade) > gradeLevels.indexOf(currentGrade)) {
        planned += credits;
      }
    });

    return { total, earned, planned };
  };

  const { total, earned, planned } = getCreditCounts();

  const takenCourseIds = new Set();
Object.values(courses).forEach((gradeCourses) => {
  gradeCourses.forEach((c) => takenCourseIds.add(c.id));
});

return (
  <div className="planner-container">
    <div className="credit-summary">
      <h3>Credit Summary</h3>
      <p><strong>Total Selected:</strong> {total} credits</p>
      <p><strong>Earned:</strong> {earned} credits</p>
      <p><strong>Planned:</strong> {planned} credits</p>
    </div>

    <div className="planner-columns">
      {gradeLevels.map((grade) => {
        const selected = courses[grade] || [];
        const isCurrent = grade === currentGrade;
        const isFuture = gradeLevels.indexOf(grade) > gradeLevels.indexOf(currentGrade);
        const artsCourse = selected.find(c => c.group === "arts");
        const nonArtsCourses = selected.filter(c => c.group !== "arts");

        const totalCredits = selected.reduce((sum, c) => sum + c.credits, 0);
        const maxCredits = 8;
        const emptySlots = Math.max(0, Math.floor(maxCredits - totalCredits));
        const needsArts = grade === "Grade 9" && !artsCourse;

        return (
          <div key={grade} className="grade-column">
            <div className="grade-header">
              {grade}
              <br />
              <span className="sub">{isCurrent ? "Current Grade" : isFuture ? "Plan Ahead" : "Completed"}</span>
            </div>

            {nonArtsCourses.map((course) => (
              <div
  key={course.id}
  className={`course-box ${course.required ? "required" : ""} clickable`}
  onClick={() => {
    const descriptionMatch = courseDescriptions.find(cd => cd.courseCode === course.code);
    setSelectedCourseDetail({
      ...course,
      description: descriptionMatch?.description || "No description available.",
      units: descriptionMatch?.units || [],
      hours: descriptionMatch?.hours || "Not specified",
      prerequisites: course.prerequisite ? [course.prerequisite] : [],
    });
    setDetailModalOpen(true);
  }}
>
                <div className="course-title">{course.title}</div>
                <div className="course-code">
                  <span>{course.code}</span>
                  <span>{course.credits} Credit</span>
                </div>
                {course.prerequisite && (
                  <div className="course-prereq">
                    Prerequisite: <strong>{course.prerequisite}</strong>
                  </div>
                )}

                {(isCurrent || isFuture) && !course.required && (!hasSubmitted || !isCurrent) && (
                  <button
                    className="remove-course-btn"
                    onClick={() => handleRemoveCourse(grade, course.id)}
                  >
                    ✕
                  </button>
                )}

                {!isCurrent && !isFuture && <span className="planned-tag">Completed</span>}
                {isFuture && <span className="planned-tag">Planned</span>}
              </div>
            ))}

            {/* Arts requirement for Grade 9 */}
            {grade === "Grade 9" && (
              <div
                className={`course-box ${artsCourse ? "" : "empty"} clickable`}
                onClick={() => handleAddCourse(grade, "arts")}
              >
                {artsCourse ? (
                  <>
                    <div className="course-title">{artsCourse.title}</div>
                    <div className="course-code">
                      <span>{artsCourse.code}</span>
                      <span>{artsCourse.credits} Credit</span>
                    </div>
                    <div className="sub">(Arts Requirement)</div>
                  </>
                ) : (
                  "+ Arts Requirement"
                )}
              </div>
            )}

            {/* Empty slots */}
            {Array.from({ length: emptySlots - (needsArts ? 1 : 0) }).map((_, i) => (
              <div
                key={i}
                className={`course-box empty ${(isCurrent || isFuture) && (!hasSubmitted || !isCurrent) ? "clickable" : ""}`}
                onClick={() => handleAddCourse(grade)}
              >
                + Course
              </div>
            ))}

            {/* Submit button for current grade */}
            {isCurrent && !hasSubmitted && (
              <button className="submit-grade-btn" onClick={() => handleSubmitCourses(grade)}>
                Submit All Courses
              </button>
            )}
          </div>
        );
      })}
    </div>

    <CourseDetailModal
  open={detailModalOpen}
  onClose={() => setDetailModalOpen(false)}
  course={selectedCourseDetail}
/>


    <CourseModal
      open={modalOpen}
      onClose={() => {
        setModalOpen(false);
        setFilterGroup(null);
      }}
      onSelect={handleSelectCourse}
      courseOptions={
  (filterGroup === "arts" ? artsCourses : availableCourses)
    .filter(c => !takenCourseIds.has(c.id))
    .map(course => {
      const descriptionMatch = courseDescriptions.find(cd => cd.courseCode === course.code);
      return {
        ...course,
        description: descriptionMatch?.description || "No description available.",
        units: descriptionMatch?.units || [],
      };
    })
}



    />
  </div>
);
}