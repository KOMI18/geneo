import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDXWAE0QC9h1_bz1MVbOfGyBy2HpP8_ceQ",
  authDomain: "covoituragebbc.firebaseapp.com",
  projectId: "covoituragebbc",
  storageBucket: "covoituragebbc.firebasestorage.app",
  messagingSenderId: "813461008345",
  appId: "1:813461008345:web:5ca1209af487a6f08e33c8",
  measurementId: "G-W2H6YXY5ZP"

};


// Singleton pour éviter de réinitialiser l'app à chaque rechargement Next.js
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };