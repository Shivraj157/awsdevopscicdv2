import { auth } from './firebase-config.js';
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Redirect if not logged in
onAuthStateChanged(auth, user => {
  if (!user && window.location.pathname.includes("index.html")) {
    window.location.href = 'login.html';
  }
});

// Logout
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.onclick = async () => {
    await signOut(auth);
    window.location.href = 'login.html';
  };
}
