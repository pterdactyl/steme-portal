import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { useParams } from "react-router-dom";

import StudentStream from "./StudentStream";       // stream tab
import StudentClasslist from "./StudentClasslist"; // classlist tab
import StudentMarks from "./StudentMarks";         // marks tab

export default function StudentStreamWithTabs({ user }) {
  const { courseId } = useParams();
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Box>
      <Tabs value={tabIndex} onChange={handleTabChange} aria-label="Course tabs">
        <Tab label="Stream" />
        <Tab label="Classlist" />
        <Tab label="Marks" />
      </Tabs>

      <Box mt={2}>
        {tabIndex === 0 && <StudentStream user={user} courseId={courseId} />}
        {tabIndex === 1 && <StudentClasslist courseId={courseId} />}
        {tabIndex === 2 && <StudentMarks user={user} courseId={courseId} />}
      </Box>
    </Box>
  );
}
