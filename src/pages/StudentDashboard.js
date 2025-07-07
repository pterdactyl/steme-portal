import { Typography, Button, List, ListItem, ListItemText } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { db } from '../Auth/firebase'; // Adjust path to your firebase config
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useState, useEffect } from 'react';

export default function StudentDashboard({ user }) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  async function getStudentCourses() {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'courses'),
        where('studentIds', 'array-contains', user.uid)
      );

      const snapshot = await getDocs(q);
      const courseList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCourses(courseList);
    } catch (error) {
      console.error("Error fetching student courses:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getStudentCourses();
  }, [user]); // Only run when user is available

  return (
    <div>
      <Typography variant="h4" gutterBottom>🎓 Welcome to the Student Dashboard!</Typography>
      
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => navigate("/course")}
        sx={{ mt: 2 }}
      >
        Go to Course
      </Button>

      <Typography variant="h6" sx={{ mt: 4 }}>
        Your Enrolled Courses:
      </Typography>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : courses.length === 0 ? (
        <Typography>No courses found.</Typography>
      ) : (
        <List>
          {courses.map((course) => (
            <ListItem key={course.id} divider>
              <ListItemText primary={course.title} secondary={course.description} />
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
}