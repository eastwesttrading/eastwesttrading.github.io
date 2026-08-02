
// ==========================================
// FIREBASE CONFIGURATION
// EAST WEST GRINDING OR MANUFACTURING OF GRAINS PLC
// ==========================================

// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ==========================================
// FIREBASE CONFIGURATION
// ==========================================

const firebaseConfig = {

    apiKey: "AIzaSyAC21sHOL7pIZi5044tNlu0hlt1rYlAqVg",

    authDomain: "east-west-trading--plc.firebaseapp.com",

    projectId: "east-west-trading--plc",

    storageBucket: "east-west-trading--plc.firebasestorage.app",

    messagingSenderId: "118174778678",

    appId: "1:118174778678:web:44cab0c573dc1c6f9e1f97"

};


// ==========================================
// INITIALIZE FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);


// ==========================================
// FIRESTORE DATABASE
// ==========================================

const db = getFirestore(app);


// ==========================================
// EXPORT DATABASE
// ==========================================

export { db };
