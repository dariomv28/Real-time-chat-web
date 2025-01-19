import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "myproject-ea7ad.firebaseapp.com",
  projectId: "myproject-ea7ad",
  storageBucket: "myproject-ea7ad.firebasestorage.app",
  messagingSenderId: "1039147197360",
  appId: "1:1039147197360:web:ac494d6c3a3a1f6ee82c75"
};


const app = initializeApp(firebaseConfig)
export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()
