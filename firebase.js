// =====================================================
// EAST WEST GRINDING OR MANUFACTURING OF GRAINS PLC
// Firebase Configuration
// =====================================================

// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";


// =====================================================
// Firebase Config
// =====================================================

const firebaseConfig = {

    apiKey: "YOUR_API_KEY",

    authDomain: "east-west-trading--plc.firebaseapp.com",

    projectId: "east-west-trading--plc",

    storageBucket: "east-west-trading--plc.appspot.com",

    messagingSenderId: "118174778678",

    appId: "1:118174778678:web:44cab0c573dc1c6f9e1f97"

};


// =====================================================
// Initialize Firebase
// =====================================================

const app = initializeApp(firebaseConfig);


// =====================================================
// Services
// =====================================================

const db = getFirestore(app);

const auth = getAuth(app);

const storage = getStorage(app);


// =====================================================
// Export
// =====================================================

export {

    db,

    auth,

    storage,

    collection,

    addDoc,

    getDocs,

    getDoc,

    updateDoc,

    deleteDoc,

    doc,

    query,

    orderBy,

    signInWithEmailAndPassword,

    signOut,

    onAuthStateChanged,

    ref,

    uploadBytes,

    getDownloadURL,

    deleteObject

};
