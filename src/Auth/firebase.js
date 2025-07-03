// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBO11atD6x-3ZPKl65keuPnBizJEX5LXTc",
  authDomain: "stemeportal.firebaseapp.com",
  projectId: "stemeportal",
  storageBucket: "stemeportal-464814.appspot.com",
  messagingSenderId: "556348508342",
  appId: "1:556348508342:web:050334e9cb6dd9d2847e17",
  measurementId: "G-H8M62GDXRN"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
