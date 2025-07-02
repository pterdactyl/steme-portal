import { db } from './firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

async function createCourseWithInitialVersion(courseId, title, teacherIds) {
    const courseRef = doc(db, 'courses', courseId);
    const versionRef = doc(db, 'courses', courseId, 'versions', 'v1');
    
  
    try {
      await setDoc(courseRef, {
        title,
        teacherIds, // 🔁 array of UIDs
        currentVersion: 'v1',
      });
  
      await setDoc(versionRef, {
        versionNumber: 1,
        pdf: `/pdfs/${courseId}_v1.pdf`,
        updatedAt: Timestamp.now(),
        updatedBy: teacherIds[0], // First creator (optional)
      });
  
      console.log(`Course ${courseId} created with multiple teachers.`);
    } catch (error) {
      console.log(`error`);
      console.error('Error creating course:', error);
    }
  }

  export { createCourseWithInitialVersion };

