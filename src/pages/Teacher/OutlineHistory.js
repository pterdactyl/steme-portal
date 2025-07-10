import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import OutlineContent from './OutlineContent';

export default function OutlineHistory() {
  const { courseId } = useParams();
  const [versions, setVersions] = useState([]);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(`http://localhost:4000/api/outlines/${courseId}/history`);
        const data = await res.json();
        setVersions(data);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      }
    }
    fetchHistory();
  }, [courseId]);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h2>Outline History for {courseId}</h2>
      {versions.map((version, index) => (
        <div key={version.id} style={{ border: '1px solid #ccc', margin: '20px 0', padding: 10 }}>
          <h4>Version {index + 1} (Saved on {new Date(version.updated_at).toLocaleString()})</h4>
          <OutlineContent
            outline={{
              courseName: version.course_name,
              grade: version.grade,
              courseType: version.course_type,
              credit: version.credit,
              description: version.description,
              learningGoals: version.learning_goals,
              assessment: version.assessment,
            }}
            units={version.units}
            finalAssessments={version.final_assessments}
            totalHours={version.total_hours}
            viewOnly={true}
          />
        </div>
      ))}
    </div>
  );
}