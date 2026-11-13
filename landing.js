/* =========================================================================
   LANDING.JS - If the visitor already registered earlier (so a user is
   saved in LocalStorage via auth.js), send them straight to the dashboard
   instead of back through the registration form.
   ========================================================================= */

const getStartedBtn = document.getElementById("getStartedBtn");
const navAuthLink   = document.getElementById("navAuthLink");

const existingUser = getCurrentUser(); // helper lives in auth.js

if (existingUser) {
  getStartedBtn.textContent = "Go to Dashboard";
  getStartedBtn.addEventListener("click", function () {
    window.location.href = "home.html";
  });
  navAuthLink.textContent = "Dashboard";
  navAuthLink.href = "home.html";
} else {
  getStartedBtn.addEventListener("click", function () {
    window.location.href = "register.html";
  });
  navAuthLink.textContent = "Register";
  navAuthLink.href = "register.html";
}
