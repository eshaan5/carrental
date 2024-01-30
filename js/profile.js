if (!localStorage.getItem("currentUser")) {
  // User not logged in, redirect to login page
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function () {
  // Load user details when the page is loaded
  loadUserDetails();
  if (localStorage.getItem("currentUser") == "admin") {
    document.getElementById("links").children[0].attributes[0].value = "admin.html";
    document.getElementById("links").children[1].attributes[0].value = "analytics.html";
    document.getElementById("links").children[1].innerText = "Analytics";
    document.getElementById("links").children[2].attributes[0].value = "carRegistration.html";
    document.getElementById("links").children[2].innerText = "Add Car";
  }
});

function loadUserDetails() {
  // Retrieve username from local storage
  const storedUsername = localStorage.getItem("currentUser");

  // Retrieve users array from local storage
  const users = JSON.parse(localStorage.getItem("users")) || [];

  // Find the user in the array based on the stored username
  const user = users.find((u) => u.username === storedUsername) || {};

  // Display welcome message with first and last name
  const welcomeMessage = `Welcome, ${user.firstName || ""} ${user.lastName || ""}!`;
  document.getElementById("welcome-message").innerText = welcomeMessage;

  // Display other user details
  document.getElementById("username").innerText = user.username || "";
  document.getElementById("email").innerText = user.email || "";
  document.getElementById("phone").innerText = user.phone || "";
}

function showChangePasswordForm() {
  // Hide user details and show change password form
  document.getElementById("user-details").style.display = "none";
  document.getElementById("change-password-form").style.display = "block";
}

function changePassword() {
  const currentPasswordInput = document.getElementById("current-password");
  const newPasswordInput = document.getElementById("new-password");
  const confirmNewPasswordInput = document.getElementById("confirm-new-password");
  const passwordChangeError = document.getElementById("password-change-error");

  // Reset previous error messages
  passwordChangeError.textContent = "";

  const currentPassword = currentPasswordInput.value;
  const newPassword = newPasswordInput.value;
  const confirmNewPassword = confirmNewPasswordInput.value;

  // Basic validation
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    passwordChangeError.textContent = "Please fill in all fields.";
    return;
  }

  // Password strength validation
  if (!isValidPassword(newPassword)) {
    passwordChangeError.textContent = "Password should be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one digit.";
    return;
  }

  if (newPassword !== confirmNewPassword) {
    passwordChangeError.textContent = "New passwords do not match.";
    return;
  }

  // Retrieve the users array from local storage
  const users = JSON.parse(localStorage.getItem("users")) || [];

  // Retrieve the current user from the array using the username
  const username = localStorage.getItem("currentUser");
  const currentUserIndex = users.findIndex((user) => user.username === username);

  if (currentUserIndex === -1) {
    // User not found in the array
    passwordChangeError.textContent = "User not found.";
    return;
  }

  // Check if the entered current password matches the stored password
  if (currentPassword !== users[currentUserIndex].password) {
    passwordChangeError.textContent = "Current password is incorrect.";
    return;
  }

  // Update the user's password
  users[currentUserIndex].password = newPassword;

  // Save the updated users array back to local storage
  localStorage.setItem("users", JSON.stringify(users));

  // Display a success message
  showPasswordToast();

  // Reset the form and display user details
  currentPasswordInput.value = "";
  newPasswordInput.value = "";
  confirmNewPasswordInput.value = "";
  document.getElementById("user-details").style.display = "block";
  document.getElementById("change-password-form").style.display = "none";
}

function isValidPassword(password) {
  // Password should be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one digit
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+<>?])[A-Za-z\d!@#$%^&*()_+<>?]{8,}$/;
  return passwordRegex.test(password);
}

function showPasswordToast() {
  const passwordToast = document.getElementById('password-toast');
  passwordToast.classList.add('show');

  setTimeout(() => {
    passwordToast.classList.remove('show');
  }, 5000); // Adjust the timeout (in milliseconds) based on how long you want the toast to be visible
}
