import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDK-DAjqvw-UolLLzUSdoag6f_o7U7GCSc",
  authDomain: "union-member-achievement.firebaseapp.com",
  projectId: "union-member-achievement",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
