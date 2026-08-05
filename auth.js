import { auth } from './firebase.js';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { showNotification } from './utils.js';

export function protectAdminRoute(onAuthenticated, onUnauthenticated) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      if (onAuthenticated) onAuthenticated(user);
    } else {
      if (onUnauthenticated) onUnauthenticated();
    }
  });
}

export async function loginAdmin(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    showNotification("Logged in successfully");
    return userCredential.user;
  } catch (error) {
    showNotification(error.message, "error");
    throw error;
  }
}

export async function logoutAdmin() {
  try {
    await signOut(auth);
    window.location.href = 'index.html';
  } catch (error) {
    showNotification("Error signing out", "error");
  }
}

export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    showNotification("Password reset email sent!");
  } catch (error) {
    showNotification(error.message, "error");
  }
}
