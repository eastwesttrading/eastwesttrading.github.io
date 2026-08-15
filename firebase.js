// ============================================================
// EAST WEST GRINDING OR MANUFACTURING OF GRAINS PLC
// Firebase Configuration & Services
// ============================================================

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    setDoc,
    query,
    orderBy,
    limit,
    where,
    serverTimestamp
} from
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";


// ============================================================
// 1. FIREBASE PROJECT CONFIGURATION
// ============================================================
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// ============================================================
// 2. INITIALIZE FIREBASE
// ============================================================

const app = initializeApp(firebaseConfig);


// ============================================================
// 3. INITIALIZE SERVICES
// ============================================================

const db = getFirestore(app);

const auth = getAuth(app);

const storage = getStorage(app);


// ============================================================
// 4. EXPORT EVERYTHING USED BY THE WEBSITE
// ============================================================

export {
    // Firebase services
    app,
    db,
    auth,
    storage,

    // Firestore
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    setDoc,
    query,
    orderBy,
    limit,
    where,
    serverTimestamp,

    // Authentication
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,

    // Storage
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
};
