// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCuMKaE8wnMR_YquVKcyGMlGga9HWqHcDs",
  authDomain: "steme-portal-754ca.firebaseapp.com",
  projectId: "steme-portal-754ca",
  storageBucket: "steme-portal-754ca.appspot.com",
  messagingSenderId: "115370400317",
  appId: "1:115370400317:web:23911fbe8689fc56316854",
  measurementId: "G-GWZDLTWJCH"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
