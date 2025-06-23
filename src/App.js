import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./Login";
import Navbar from "./Navbar";
import TeacherDashboard from "./TeacherDashboard";
import StudentDashboard from "./StudentDashboard";
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