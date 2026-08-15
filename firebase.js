// ============================================================
// EAST WEST GRINDING OR MANUFACTURING OF GRAINS PLC
// Central Firebase Configuration & Module Re-exports
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc, 
    doc, 
    query, 
    orderBy, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// Your web app's Firebase configuration
// Locate these exact values in: Firebase Console > Project Settings > General > SDK setup/configuration
const firebaseConfig = {
  apiKey: "AIzaSyAC21sHOL7pIZi5044tNlu0hlt1rYlAqVg",
  authDomain: "east-west-trading--plc.firebaseapp.com",
  databaseURL: "https://east-west-trading--plc-default-rtdb.firebaseio.com",
  projectId: "east-west-trading--plc",
  storageBucket: "east-west-trading--plc.firebasestorage.app",
  messagingSenderId: "118174778678",
  appId: "1:118174778678:web:44cab0c573dc1c6f9e1f97",
  measurementId: "G-QVQCLT0JB3"
};

// Initialize Firebase App & Services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export instances and functions for script.js and admin.js
export {
    app,
    auth,
    db,
    storage,
    // Auth Methods
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    // Firestore Methods
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    orderBy,
    serverTimestamp,
    // Storage Methods
    ref,
    uploadBytes,
    getDownloadURL
};
