/* =========================================================================
   AUTH.JS - Shared user storage & login-state helpers
   Used by: register.html (to create a user), signin.html (to log in an
   existing user) and home.html (to check who is logged in and show their
   avatar). No backend - everything lives in the browser's LocalStorage,
   same as the medicine data.
   ========================================================================= */

/* Returns the full list of registered users (an array of objects). */
function getUsers() {
  return JSON.parse(localStorage.getItem("meditrack_users")) || [];
}

/* Saves the full list of registered users back to LocalStorage. */
function saveUsers(users) {
  localStorage.setItem("meditrack_users", JSON.stringify(users));
}

/* Adds one new user to the stored list. Does NOT log them in -
   after registering, the user is sent to the Sign In page and must
   enter their new credentials there (via loginUser() below) before
   they can reach the dashboard. */
function registerUser(user) {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
}

/* Returns the currently logged-in user object, or null if nobody is. */
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("meditrack_currentUser")) || null;
}

/* Logs the current user out and sends them back to the landing page. */
function logoutUser() {
  localStorage.removeItem("meditrack_currentUser");
  window.location.href = "index.html";
}

/* Call this at the very top of a protected page (like home.html).
   If nobody is logged in, send them to the landing page instead and
   return null so the calling script knows to stop. */
function requireLogin() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "index.html";
    return null;
  }
  return user;
}

/* Builds the small avatar circle + name + logout button and drops it
   into the element with the given id (e.g. "userBadge" in home.html). */
function renderUserBadge(user, containerId) {
  const container = document.getElementById(containerId);
  if (!container || !user) return;

  const initial = user.fullName.trim().charAt(0).toUpperCase();

  container.innerHTML =
    '<div class="user-avatar" title="' + user.fullName + '">' + initial + '</div>' +
    '<span class="user-name">' + user.fullName + '</span>' +
    '<button id="logoutBtn" class="logout-btn" title="Log out">\u23FB</button>';

  document.getElementById("logoutBtn").addEventListener("click", logoutUser);
}

/* =========================================================================
   NEW: SIGN-IN HELPER (used by signin.html)
   Looks up a registered user by Employee ID OR Email, and checks the
   password. If it matches, that user becomes the "currentUser" (same
   as what registerUser() does) and we return true. If nothing matches,
   we return false so signin.js can show an error.
   ========================================================================= */
function loginUser(identifier, password) {
  const users = getUsers();
  const match = users.find(function (u) {
    return (u.employeeId === identifier || u.email === identifier) && u.password === password;
  });

  if (!match) return false;

  localStorage.setItem("meditrack_currentUser", JSON.stringify(match));
  return true;
}