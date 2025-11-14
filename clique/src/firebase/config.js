import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Firebase configuration - Replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyAXMd5dNEcFe23h5hXrCxpEwF22xlUbFPI",
  authDomain: "clique-1b68e.firebaseapp.com",
  projectId: "clique-1b68e",
  storageBucket: "clique-1b68e.firebasestorage.app",
  messagingSenderId: "916980259367",
  appId: "1:916980259367:web:44b590e2b1dd05d3184c02"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)

export default app
