// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";



// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAnUgmARXzAfQnuYhzY6n6l39LyY6QD6TM",
  authDomain: "habit-tracker-fc3cb.firebaseapp.com",
  projectId: "habit-tracker-fc3cb",
  storageBucket: "habit-tracker-fc3cb.firebasestorage.app",
  messagingSenderId: "315747899290",
  appId: "1:315747899290:web:04d53f9c61ec5457fecc23",
  measurementId: "G-4S0ZC6SC34"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);