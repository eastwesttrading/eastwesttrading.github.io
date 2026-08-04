
import { db, auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

/* =====================================================
   DOM ELEMENTS
===================================================== */

const loginSection = document.getElementById("loginSection");
const adminDashboard = document.getElementById("adminDashboard");
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");
const loginError = document.getElementById("loginError");

/* =====================================================
   HELPER FUNCTIONS
===================================================== */

function showDashboard() {
    loginSection.style.display = "none";
    adminDashboard.style.display = "block";
}

function showLogin() {
    loginSection.style.display = "block";
    adminDashboard.style.display = "none";
}

function showError(message) {
    loginError.style.display = "block";
    loginError.innerText = message;
}

function hideError() {
    loginError.style.display = "none";
    loginError.innerText = "";
}

/* =====================================================
   AUTHENTICATION
===================================================== */

onAuthStateChanged(auth, async (user) => {

    if (user) {

        showDashboard();

        console.log("Logged in:", user.email);

        // We'll load all website data here in Part 2
        await initializeDashboard();

    } else {

        showLogin();

    }

});

/* =====================================================
   LOGIN
===================================================== */

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    hideError();

    const email = document
        .getElementById("loginEmail")
        .value
        .trim();

    const password = document
        .getElementById("loginPassword")
        .value;

    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

    }

    catch (error) {

        showError(error.message);

        console.error(error);

    }

});

/* =====================================================
   LOGOUT
===================================================== */

logoutBtn.addEventListener("click", async () => {

    try {

        await signOut(auth);

    }

    catch (error) {

        alert(error.message);

    }

});

/* =====================================================
   DASHBOARD INITIALIZATION
===================================================== */

async function initializeDashboard() {

    console.log("Dashboard Ready");

    // Part 2
    // Load Theme
    // Load Hero
    // Load Company
    // Load Contact
    // Load Products

}
