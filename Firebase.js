import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  // Paste your Firebase configuration here
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
