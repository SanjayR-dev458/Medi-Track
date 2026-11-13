/* =========================================================================
   REGISTER.JS - Registration form validation & submission.
   Uses the shared user-storage helpers from auth.js.
   ========================================================================= */

/* ---------- STEP 1: Grab references to all the form fields ---------- */
const registerForm         = document.getElementById("registerForm");
const fullNameInput        = document.getElementById("fullName");
const employeeIdInput      = document.getElementById("employeeId");
const emailInput           = document.getElementById("email");
const mobileInput          = document.getElementById("mobile");
const divisionInput        = document.getElementById("division");
const passwordInput        = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

/* ---------- STEP 2: Regex patterns used for validation ---------- */
const NAME_REGEX     = /^[A-Za-z ]{3,50}$/;                                 // letters & spaces, 3-50 chars
const EMP_ID_REGEX   = /^[A-Za-z0-9]{4,12}$/;                               // letters/numbers, 4-12 chars
const EMAIL_REGEX    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;                        // basic email shape
const MOBILE_REGEX   = /^\d{10}$/;                                         // exactly 10 digits
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;  // 8+ chars: upper, lower, digit, symbol

/* ---------- STEP 3: Helpers to show/clear error messages ---------- */
function showError(id, message) {
  document.getElementById(id).textContent = message;
}

function clearErrors() {
  [
    "errFullName", "errEmployeeId", "errEmail",
    "errMobile", "errDivision", "errPassword", "errConfirmPassword"
  ].forEach(function (id) {
    document.getElementById(id).textContent = "";
  });
}

/* ---------- STEP 4: Validate the whole form, field by field ---------- */
function validateRegisterForm() {
  let isValid = true;
  clearErrors();

  if (!NAME_REGEX.test(fullNameInput.value.trim())) {
    showError("errFullName", "Enter a valid name (letters & spaces only, 3-50 characters).");
    isValid = false;
  }

  if (!EMP_ID_REGEX.test(employeeIdInput.value.trim())) {
    showError("errEmployeeId", "Employee ID must be 4-12 letters/numbers (e.g. EMP1024).");
    isValid = false;
  }

  if (!EMAIL_REGEX.test(emailInput.value.trim())) {
    showError("errEmail", "Enter a valid email address.");
    isValid = false;
  }

  if (!MOBILE_REGEX.test(mobileInput.value.trim())) {
    showError("errMobile", "Mobile number must be exactly 10 digits.");
    isValid = false;
  }

  if (divisionInput.value === "") {
    showError("errDivision", "Please select a division.");
    isValid = false;
  }

  if (!PASSWORD_REGEX.test(passwordInput.value)) {
    showError("errPassword", "Min 8 characters, with an uppercase, lowercase, number & symbol.");
    isValid = false;
  }

  if (confirmPasswordInput.value !== passwordInput.value || confirmPasswordInput.value === "") {
    showError("errConfirmPassword", "Passwords do not match.");
    isValid = false;
  }

  return isValid;
}

/* ---------- STEP 5: Handle the form submission ---------- */
registerForm.addEventListener("submit", function (e) {
  e.preventDefault(); // stop the page from refreshing

  if (!validateRegisterForm()) return;

  // Check this Employee ID / email isn't already registered (getUsers lives in auth.js)
  const users = getUsers();
  const duplicate = users.some(function (u) {
    return u.employeeId === employeeIdInput.value.trim() || u.email === emailInput.value.trim();
  });

  if (duplicate) {
    showError("errEmployeeId", "An account with this Employee ID or Email already exists.");
    return;
  }

  const newUser = {
    fullName: fullNameInput.value.trim(),
    employeeId: employeeIdInput.value.trim(),
    email: emailInput.value.trim(),
    mobile: mobileInput.value.trim(),
    division: divisionInput.value,
    password: passwordInput.value // NOTE: stored in plain text - fine for this local/offline demo only
  };

  registerUser(newUser); // saves the user only - does NOT log them in (auth.js)

  // Send them to the Sign In page so they log in with the credentials
  // they just created. "?registered=1" lets signin.js show a success note.
  window.location.href = "signin.html?registered=1";
});