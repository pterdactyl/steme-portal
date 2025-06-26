import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const navigate = useNavigate();
  return (
    <div>
      <Typography variant="h4">🎓 Welcome to the Student Dashboard!</Typography>
      
    </div>
  )

}