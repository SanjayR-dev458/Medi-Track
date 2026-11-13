/* =========================================================================
   MEDICINE EXPIRY DATE REMINDER SYSTEM - JavaScript Logic
   Beginner-friendly comments included on every function.
   ========================================================================= */

/* ---------- STEP 0: Make sure someone is logged in (uses auth.js) ----------
   requireLogin() lives in auth.js. If nobody is registered/logged in yet,
   it redirects back to the landing page and we skip the rest of the setup. */
const loggedInUser = requireLogin();

if (loggedInUser) {
  // Draw the small avatar + name + logout button in the header (also in auth.js)
  renderUserBadge(loggedInUser, "userBadge");
}

/* ---------- STEP 1: Grab references to all HTML elements we need ---------- */
const medicineForm   = document.getElementById("medicineForm");
const medNameInput    = document.getElementById("medName");
const medCategoryInput= document.getElementById("medCategory");
const medQuantityInput= document.getElementById("medQuantity");
const medExpiryInput  = document.getElementById("medExpiry");

const tableBody  = document.getElementById("medicineTableBody");
const emptyMsg   = document.getElementById("emptyMsg");

const searchInput  = document.getElementById("searchInput");
const filterStatus = document.getElementById("filterStatus");
const sortOrder    = document.getElementById("sortOrder");

const statTotal   = document.getElementById("statTotal");
const statSafe    = document.getElementById("statSafe");
const statWarning = document.getElementById("statWarning");
const statExpired = document.getElementById("statExpired");

/* ---------- STEP 2: Our "database" lives in an array of objects ----------
   Each medicine is an object like:
   { id: 171234, name: "Paracetamol", category: "Tablet", quantity: 10, expiry: "2026-12-01" }
   We load it from LocalStorage when the page starts, and save back to
   LocalStorage every time it changes - that's how data "survives" a refresh. */
let medicines = JSON.parse(localStorage.getItem("medicines")) || [];

/* Saves the current `medicines` array into the browser's LocalStorage.
   LocalStorage only stores strings, so we convert our array to a JSON string. */
function saveToStorage() {
  localStorage.setItem("medicines", JSON.stringify(medicines));
}

/* ---------- STEP 3: Work out how many days are left until expiry ----------
   Takes a date string like "2026-12-01" and returns a number of days
   (negative if the medicine has already expired). */
function getDaysLeft(expiryDateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // ignore time-of-day, compare dates only

  const expiryDate = new Date(expiryDateStr);
  expiryDate.setHours(0, 0, 0, 0);

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((expiryDate - today) / msPerDay);
}

/* Classifies a medicine's status based on days left:
   - "expired"  -> days left is 0 or negative
   - "warning"  -> expiring within the next 30 days
   - "safe"     -> more than 30 days left */
function getStatus(daysLeft) {
  if (daysLeft <= 0) return "expired";
  if (daysLeft <= 30) return "warning";
  return "safe";
}

/* Converts a status keyword into a readable label + badge class. */
function getStatusLabel(status) {
  if (status === "expired") return "Expired";
  if (status === "warning") return "Expiring Soon";
  return "Safe";
}

/* ---------- STEP 4: FORM VALIDATION ----------
   Checks each field and shows an error message if invalid.
   Returns true if the whole form is valid, false otherwise. */
function validateForm() {
  let isValid = true;

  // Clear old error messages first
  document.getElementById("errName").textContent = "";
  document.getElementById("errCategory").textContent = "";
  document.getElementById("errQuantity").textContent = "";
  document.getElementById("errExpiry").textContent = "";

  if (medNameInput.value.trim() === "") {
    document.getElementById("errName").textContent = "Medicine name is required.";
    isValid = false;
  }

  if (medCategoryInput.value === "") {
    document.getElementById("errCategory").textContent = "Please select a category.";
    isValid = false;
  }

  if (medQuantityInput.value === "" || Number(medQuantityInput.value) <= 0) {
    document.getElementById("errQuantity").textContent = "Enter a valid quantity (1 or more).";
    isValid = false;
  }

  if (medExpiryInput.value === "") {
    document.getElementById("errExpiry").textContent = "Expiry date is required.";
    isValid = false;
  }

  return isValid;
}

/* ---------- STEP 5: ADD a new medicine ----------
   Runs when the form is submitted. */
medicineForm.addEventListener("submit", function (e) {
  e.preventDefault(); // stop the page from refreshing (default form behaviour)

  if (!validateForm()) return; // stop here if validation failed

  const newMedicine = {
    id: Date.now(), // a unique ID based on the current timestamp
    name: medNameInput.value.trim(),
    category: medCategoryInput.value,
    quantity: Number(medQuantityInput.value),
    expiry: medExpiryInput.value
  };

  medicines.push(newMedicine); // add to our array
  saveToStorage();             // persist to LocalStorage
  medicineForm.reset();        // clear the form fields
  renderTable();                // refresh what the user sees
});

/* ---------- STEP 6: DELETE a medicine ---------- */
function deleteMedicine(id) {
  if (!confirm("Delete this medicine record?")) return;
  medicines = medicines.filter(function (med) { return med.id !== id; });
  saveToStorage();
  renderTable();
}

/* ---------- STEP 7: EDIT a medicine ----------
   For simplicity, this re-fills the form with the chosen medicine's data
   and removes it from the list; submitting the form re-adds it (now edited). */
function editMedicine(id) {
  const med = medicines.find(function (m) { return m.id === id; });
  if (!med) return;

  medNameInput.value = med.name;
  medCategoryInput.value = med.category;
  medQuantityInput.value = med.quantity;
  medExpiryInput.value = med.expiry;

  // Remove the old entry; the form submit will add the edited version back
  medicines = medicines.filter(function (m) { return m.id !== id; });
  saveToStorage();
  renderTable();

  medNameInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------- STEP 8: RENDER the table ----------
   Clears the table and rebuilds it from the `medicines` array, applying
   the current search text, filter dropdown, and sort order. */
function renderTable() {
  let list = [...medicines]; // copy so we don't change the original order permanently

  // --- SEARCH: keep only medicines whose name includes the typed text ---
  const searchTerm = searchInput.value.trim().toLowerCase();
  if (searchTerm !== "") {
    list = list.filter(function (med) {
      return med.name.toLowerCase().includes(searchTerm);
    });
  }

  // --- FILTER: keep only medicines matching the selected status ---
  const statusFilter = filterStatus.value;
  if (statusFilter !== "all") {
    list = list.filter(function (med) {
      return getStatus(getDaysLeft(med.expiry)) === statusFilter;
    });
  }

  // --- SORT: order by expiry date ascending/descending ---
  const sortValue = sortOrder.value;
  if (sortValue === "asc") {
    list.sort(function (a, b) { return new Date(a.expiry) - new Date(b.expiry); });
  } else if (sortValue === "desc") {
    list.sort(function (a, b) { return new Date(b.expiry) - new Date(a.expiry); });
  }

  // --- Build the table rows ---
  tableBody.innerHTML = ""; // clear existing rows

  list.forEach(function (med) {
    const daysLeft = getDaysLeft(med.expiry);
    const status = getStatus(daysLeft);
    const statusLabel = getStatusLabel(status);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${med.name}</td>
      <td>${med.category}</td>
      <td>${med.quantity}</td>
      <td>${med.expiry}</td>
      <td>${daysLeft <= 0 ? "0" : daysLeft}</td>
      <td><span class="badge ${status}">${statusLabel}</span></td>
      <td>
        <button class="action-btn edit-btn" onclick="editMedicine(${med.id})">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteMedicine(${med.id})">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Show "no medicines" message if the filtered list is empty
  emptyMsg.style.display = list.length === 0 ? "block" : "none";

  updateDashboard(); // refresh the stat cards every time the table changes
}

/* ---------- STEP 9: UPDATE the dashboard stat cards ----------
   Counts are always based on the FULL medicines list (not the filtered
   search/filter view), so the dashboard always reflects everything stored. */
function updateDashboard() {
  let safeCount = 0, warningCount = 0, expiredCount = 0;

  medicines.forEach(function (med) {
    const status = getStatus(getDaysLeft(med.expiry));
    if (status === "safe") safeCount++;
    else if (status === "warning") warningCount++;
    else expiredCount++;
  });

  statTotal.textContent   = medicines.length;
  statSafe.textContent    = safeCount;
  statWarning.textContent = warningCount;
  statExpired.textContent = expiredCount;
}

/* ---------- STEP 10: Re-render whenever search/filter/sort changes ---------- */
searchInput.addEventListener("input", renderTable);
filterStatus.addEventListener("change", renderTable);
sortOrder.addEventListener("change", renderTable);

/* ---------- STEP 11: Initial render when the page first loads ---------- */
renderTable();


/* =========================================================================
   THEME TOGGLE (Light / Dark Mode)
   ========================================================================= */

const themeToggleBtn = document.getElementById("themeToggleBtn");

/* On page load: check if the user picked a theme last time (saved in
   LocalStorage) and apply it immediately, so the page doesn't "flash"
   back to light mode every time they visit. */
const savedTheme = localStorage.getItem("theme") || "light";
applyTheme(savedTheme);

/* Sets the data-theme attribute on <html>. All our CSS variables in
   style.css are keyed off this attribute, so one line here changes
   every color on the page at once. */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggleBtn.textContent = theme === "dark" ? "☀️" : "🌙";
  localStorage.setItem("theme", theme); // remember the choice
}

/* When the button is clicked, flip between "light" and "dark". */
themeToggleBtn.addEventListener("click", function () {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme(newTheme);
});


/* =========================================================================
   BEGINNER-FRIENDLY RULE-BASED CHATBOT ("MediBot")
   No external API is used - it simply checks the user's message for
   keywords and replies with a matching pre-written answer. This keeps
   the whole project pure HTML/CSS/JS with no backend, as required.
   ========================================================================= */

const chatToggleBtn = document.getElementById("chatToggleBtn");
const chatWindow    = document.getElementById("chatWindow");
const chatCloseBtn  = document.getElementById("chatCloseBtn");
const chatForm      = document.getElementById("chatForm");
const chatInput     = document.getElementById("chatInput");
const chatMessages  = document.getElementById("chatMessages");

/* Open the chat window and show a greeting the very first time it opens. */
let chatHasGreeted = false;

chatToggleBtn.addEventListener("click", function () {
  chatWindow.classList.toggle("hidden");
  if (!chatHasGreeted && !chatWindow.classList.contains("hidden")) {
    addChatBubble("bot", "Hi! I'm MediBot 🤖. Ask me how to add a medicine, what 'Expiring Soon' means, or how to change the theme!");
    chatHasGreeted = true;
  }
});

chatCloseBtn.addEventListener("click", function () {
  chatWindow.classList.add("hidden");
});

/* Adds one chat bubble (either "bot" or "user") to the message list,
   and auto-scrolls down so the newest message is always visible. */
function addChatBubble(sender, text) {
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble " + sender; // "chat-bubble bot" or "chat-bubble user"
  bubble.textContent = text;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight; // scroll to the latest message
}

/* This is the "brain" of the bot: a simple list of {keywords, reply} rules.
   We check the user's message (lowercased) for each keyword in order,
   and return the first matching reply. If nothing matches, we give a
   friendly fallback response. */
const chatbotRules = [
  {
    keywords: ["add", "new medicine", "create"],
    reply: "To add a medicine: fill in the Name, Category, Quantity and Expiry Date in the form at the top, then click '+ Add Medicine'."
  },
  {
    keywords: ["delete", "remove"],
    reply: "Click the red 'Delete' button next to any medicine row. You'll be asked to confirm before it's removed."
  },
  {
    keywords: ["edit", "update", "change quantity"],
    reply: "Click the blue 'Edit' button on a row - it loads that medicine's details back into the form so you can change and re-submit them."
  },
  {
    keywords: ["expiring soon", "warning", "30 day"],
    reply: "'Expiring Soon' means the medicine's expiry date is within the next 30 days from today."
  },
  {
    keywords: ["expired"],
    reply: "'Expired' means the expiry date has already passed (0 or fewer days left)."
  },
  {
    keywords: ["safe", "not expiring"],
    reply: "'Safe' / 'Not Expiring Soon' means there are more than 30 days left before the medicine expires."
  },
  {
    keywords: ["search"],
    reply: "Use the search box above the table - type any part of a medicine's name and the list filters instantly."
  },
  {
    keywords: ["filter"],
    reply: "Use the 'All Status' dropdown to show only Safe, Expiring Soon, or Expired medicines."
  },
  {
    keywords: ["sort"],
    reply: "Use the 'Sort by Expiry' dropdown to order medicines by soonest or latest expiry date."
  },
  {
    keywords: ["theme", "dark mode", "light mode", "color"],
    reply: "Click the 🌙 / ☀️ icon in the top-right of the header to switch between light and dark themes!"
  },
  {
    keywords: ["storage", "save", "data", "refresh"],
    reply: "All your medicines are saved in your browser's LocalStorage, so your data stays even after you refresh or close the page."
  },
  {
    keywords: ["hi", "hello", "hey"],
    reply: "Hello! 👋 How can I help you with your medicine tracker today?"
  },
  {
    keywords: ["thank"],
    reply: "You're welcome! Let me know if you need anything else. 😊"
  }
];

/* Looks through chatbotRules to find a reply whose keywords appear
   anywhere in the user's message. Returns a fallback if none match. */
function getBotReply(userMessage) {
  const message = userMessage.toLowerCase();

  for (let i = 0; i < chatbotRules.length; i++) {
    const rule = chatbotRules[i];
    const matched = rule.keywords.some(function (keyword) {
      return message.includes(keyword);
    });
    if (matched) return rule.reply;
  }

  return "Sorry, I'm a simple bot and didn't understand that. Try asking about adding, editing, deleting, searching, filtering, sorting, or the theme toggle!";
}

/* Handles the chat form submission: show the user's message, then
   show the bot's reply after a tiny delay (feels more natural). */
chatForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const userMessage = chatInput.value.trim();
  if (userMessage === "") return;

  addChatBubble("user", userMessage);
  chatInput.value = "";

  setTimeout(function () {
    const reply = getBotReply(userMessage);
    addChatBubble("bot", reply);
  }, 400);
});
