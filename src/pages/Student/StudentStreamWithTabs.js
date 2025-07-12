// src/pages/StudentStreamWithTabs.js
import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";

import StudentStream from "./StudentStream";       // your existing stream component
import StudentClassList from "./StudentClasslist"; // your classlist component
import StudentMarks from "./StudentMarks";         // your marks component

export default function StudentStreamWithTabs({ user, courseId }) {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Box>
      {/* Tabs header */}
      <Tabs value={tabIndex} onChange={handleTabChange} aria-label="Course tabs">
        <Tab label="Stream" />
        <Tab label="Classlist" />
        <Tab label="Marks" />
      </Tabs>

      {/* Tabs content */}
      <Box mt={2}>
        {tabIndex === 0 && <StudentStream user={user} courseId={courseId} />}
        {tabIndex === 1 && <StudentClassList courseId={courseId} />}
        {tabIndex === 2 && <StudentMarks user={user} courseId={courseId} />}
      </Box>
    </Box>
  );
}
