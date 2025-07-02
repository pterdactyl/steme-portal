import { db } from './firebase'; // Adjust path to your firebase config
import { collection, query, where, getDocs } from 'firebase/firestore';


export const getCoursesForTeacher = async (teacherUid) => {
  const q = query(
    collection(db, 'courses'),
    where('teacherIds', 'array-contains', teacherUid)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
