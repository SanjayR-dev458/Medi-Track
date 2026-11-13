/* =========================================================================
   SIGNIN.JS - Sign-in form validation & submission.
   Uses the shared loginUser() helper from auth.js.
   ========================================================================= */

/* ---------- STEP 1: Grab references to the form fields ---------- */
const signinForm         = document.getElementById("signinForm");
const loginIdentifierInput = document.getElementById("loginIdentifier");
const loginPasswordInput   = document.getElementById("loginPassword");

/* ---------- STEP 2: Helpers to show/clear error messages ---------- */
function showSigninError(id, message) {
  document.getElementById(id).textContent = message;
}

function clearSigninErrors() {
  ["errLoginIdentifier", "errLoginPassword", "errLoginGeneral"].forEach(function (id) {
    document.getElementById(id).textContent = "";
  });
}

/* ---------- STEP 3: Validate the form fields are at least filled in ---------- */
function validateSigninForm() {
  let isValid = true;
  clearSigninErrors();

  if (loginIdentifierInput.value.trim() === "") {
    showSigninError("errLoginIdentifier", "Enter your Employee ID or Email.");
    isValid = false;
  }

  if (loginPasswordInput.value === "") {
    showSigninError("errLoginPassword", "Enter your password.");
    isValid = false;
  }

  return isValid;
}

/* ---------- STEP 4: Handle the form submission ---------- */
signinForm.addEventListener("submit", function (e) {
  e.preventDefault(); // stop the page from refreshing

  if (!validateSigninForm()) return;

  const identifier = loginIdentifierInput.value.trim();
  const password = loginPasswordInput.value;

  // loginUser() lives in auth.js: checks the stored users list and,
  // on a match, marks that user as the current logged-in user.
  const success = loginUser(identifier, password);

  if (!success) {
    showSigninError("errLoginGeneral", "Incorrect Employee ID/Email or password.");
    return;
  }

  window.location.href = "home.html"; // straight into the dashboard
});

/* ---------- STEP 5: If we just arrived fresh from registration, show a
   one-time success note above the form ("?registered=1" in the URL,
   set by register.js) so the user knows why they need to sign in. ---------- */
(function showRegisteredNote() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("registered") !== "1") return;

  const note = document.getElementById("signinSuccessNote");
  if (note) note.textContent = "Account created! Sign in with your new Employee ID/Email and password.";
})();