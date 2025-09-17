import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCZ5uK0rWqtEtiHzBOXfbH6_S1N5sECXuY",
  authDomain: "workmanagerment.firebaseapp.com",
  projectId: "workmanagerment",
  storageBucket: "workmanagerment.firebasestorage.app",
  messagingSenderId: "358076888386",
  appId: "1:358076888386:web:f30621b4cc724634d584db",
  measurementId: "G-R7BMKVLGMP"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);