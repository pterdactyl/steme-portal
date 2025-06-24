// src/App.js
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import { Box } from "@mui/material";


function App() {
  const navigate = useNavigate();

  const handleLogin = ({ email, role }) => {
    if (role === "teacher") {
      navigate("/dashboard/teacher");
    } else {
      navigate("/dashboard/student");
    }
  };

  return (

    <>
      <Navbar />
      <Box p={3}>
        <Routes>
          <Route path="/" element={<Login onLogin={handleLogin} />} />
          <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
          <Route path="/dashboard/student" element={<StudentDashboard />} />
        </Routes>
      </Box>
    </>
  );
}

export default App;
