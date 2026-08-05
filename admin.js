import { db, auth } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

/* ========= DOM ========= */

const loginSection = document.getElementById("loginSection");
const adminDashboard = document.getElementById("adminDashboard");
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");
const loginError = document.getElementById("loginError");

/* ========= AUTH ========= */

onAuthStateChanged(auth, async (user) => {

    if (user) {

        loginSection.style.display = "none";
        adminDashboard.style.display = "block";

        await loadTheme();
        await loadHero();
        await loadCompany();
        await loadContact();

    } else {

        loginSection.style.display = "block";
        adminDashboard.style.display = "none";

    }

});

/* ========= LOGIN ========= */

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    loginError.style.display = "none";

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {

        await signInWithEmailAndPassword(auth, email, password);

    } catch (error) {

        loginError.style.display = "block";
        loginError.innerText = error.message;

    }

});

/* ========= LOGOUT ========= */

logoutBtn.addEventListener("click", async () => {

    await signOut(auth);

});

/* ========= LOAD THEME ========= */

async function loadTheme() {

    const snap = await getDoc(doc(db, "content", "theme"));

    if (!snap.exists()) return;

    const data = snap.data();

    document.getElementById("logoUrl").value =
        data.logoUrl || "";

    document.getElementById("heroBgUrl").value =
        data.heroBgUrl || "";

    document.getElementById("primaryColor").value =
        data.primaryColor || "#1b5e20";

}

/* ========= SAVE THEME ========= */

document.getElementById("brandingForm")
.addEventListener("submit", async (e)=>{

    e.preventDefault();

    await setDoc(doc(db,"content","theme"),{

        logoUrl:
        document.getElementById("logoUrl").value,

        heroBgUrl:
        document.getElementById("heroBgUrl").value,

        primaryColor:
        document.getElementById("primaryColor").value

    });

    alert("Theme Updated");

});

/* ========= LOAD HERO ========= */

async function loadHero(){

    const snap =
    await getDoc(doc(db,"content","hero"));

    if(!snap.exists()) return;

    const data = snap.data();

    document.getElementById("heroHeadline").value =
    data.headline || "";

    document.getElementById("heroSubhead").value =
    data.subhead || "";

}

/* ========= SAVE HERO ========= */

document.getElementById("heroForm")
.addEventListener("submit",async(e)=>{

    e.preventDefault();

    await setDoc(doc(db,"content","hero"),{

        headline:
        document.getElementById("heroHeadline").value,

        subhead:
        document.getElementById("heroSubhead").value

    });

    alert("Hero Updated");

});

/* ========= LOAD COMPANY ========= */

async function loadCompany(){

    const snap =
    await getDoc(doc(db,"company","info"));

    if(!snap.exists()) return;

    const data = snap.data();

    document.getElementById("compMission").value =
    data.mission || "";

    document.getElementById("compVision").value =
    data.vision || "";

}

/* ========= SAVE COMPANY ========= */

document.getElementById("missionForm")
.addEventListener("submit",async(e)=>{

    e.preventDefault();

    await setDoc(doc(db,"company","info"),{

        mission:
        document.getElementById("compMission").value,

        vision:
        document.getElementById("compVision").value

    });

    alert("Mission Updated");

});

/* ========= LOAD CONTACT ========= */

async function loadContact(){

    const snap =
    await getDoc(doc(db,"content","contact"));

    if(!snap.exists()) return;

    const data = snap.data();

    document.getElementById("contactPhone").value =
    data.phone || "";

    document.getElementById("contactEmail").value =
    data.email || "";

    document.getElementById("contactAddress").value =
    data.address || "";

}

/* ========= SAVE CONTACT ========= */

document.getElementById("contactInfoForm")
.addEventListener("submit",async(e)=>{

    e.preventDefault();

    await setDoc(doc(db,"content","contact"),{

        phone:
        document.getElementById("contactPhone").value,

        email:
        document.getElementById("contactEmail").value,

        address:
        document.getElementById("contactAddress").value

    });

    alert("Contact Updated");

});
