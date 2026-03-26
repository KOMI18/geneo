import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {

  apiKey: "AIzaSyCj-MU_kpRc2sVlIjqphT36VlMcEshr6ws",

  authDomain: "covoituragebbc.firebaseapp.com",

  projectId: "covoituragebbc",

  storageBucket: "covoituragebbc.firebasestorage.app",

  messagingSenderId: "813461008345",

  appId: "1:813461008345:web:c161e6851bcb4c398e33c8",

  measurementId: "G-QS95L713L1"

};



// Singleton pour éviter de réinitialiser l'app à chaque rechargement Next.js
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };