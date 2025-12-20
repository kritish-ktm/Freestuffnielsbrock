// src/firebase.js
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";  // CORRECT

const firebaseConfig = {
  apiKey: "AIzaSyDR2rSXwGgfoqJszPCnB6-USVB4FnR89dc",
  authDomain: "free-stuff-nielsbrock.firebaseapp.com",
  projectId: "free-stuff-nielsbrock",
  storageBucket: "free-stuff-nielsbrock.firebasestorage.app",
  messagingSenderId: "622024988493",
  appId: "1:622024988493:web:d27f3f45b6b6e805a10904"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const storage = getStorage(app);  // WORKS

googleProvider.setCustomParameters({
  prompt: "select_account"
});

export {
  auth,
  db,
  storage,  // EXPORTED
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
};