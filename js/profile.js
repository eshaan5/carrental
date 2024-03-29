if (!JSON.parse(localStorage.getItem("currentUser"))) {
  // User not logged in, redirect to login page
  window.location.href = "login.html";
}

var currentPasswordInput = document.getElementById("current-password");
var newPasswordInput = document.getElementById("new-password");
var confirmNewPasswordInput = document.getElementById("confirm-new-password");
var passwordChangeError = document.getElementById("password-change-error");

newPasswordInput.addEventListener("input", function () {
  passwordChangeError.textContent = "";
  if (!isValidPassword(newPasswordInput.value)) {
    passwordChangeError.textContent = "Password should be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one digit.";
  } else {
    passwordChangeError.textContent = "";
  }
});

confirmNewPasswordInput.addEventListener("input", function () {
  passwordChangeError.textContent = "";
  if (newPasswordInput.value !== confirmNewPasswordInput.value) {
    passwordChangeError.textContent = "New passwords do not match.";
  }
});

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
  var storedUsername = JSON.parse(localStorage.getItem("currentUser")).username;

  // Retrieve user details from IndexedDB
  getByKey(storedUsername, "users")
    .then(function (user) {
      // Display welcome message with first and last name
      var welcomeMessage = `Welcome, ${user.firstName || ""} ${user.lastName || ""}!`;
      document.getElementById("welcome-message").innerText = welcomeMessage;

      // Display other user details
      document.getElementById("username").innerText = user.username || "";
      document.getElementById("email").innerText = user.email || "";
      document.getElementById("phone").innerText = user.phone || "";
    })
    .catch(function (error) {
      console.error("Error loading user details:", error);
      // Handle error, such as displaying an error message to the user
    });
}

function showChangePasswordForm() {
  // Hide user details and show change password form
  document.getElementById("user-details").style.display = "none";
  document.getElementById("change-password-form").style.display = "block";
}

function changePassword() {
  // Reset previous error messages
  passwordChangeError.textContent = "";

  var currentPassword = currentPasswordInput.value;
  var newPassword = newPasswordInput.value;
  var confirmNewPassword = confirmNewPasswordInput.value;

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

  // Retrieve the current user's username
  var username = JSON.parse(localStorage.getItem("currentUser")).username;

  // Retrieve the current user from IndexedDB
  getByKey(username, "users")
    .then(function (user) {
      // Check if the entered current password matches the stored password
      if (currentPassword !== user.password) {
        passwordChangeError.textContent = "Current password is incorrect.";
        return;
      }

      // Update the user's password
      user.password = newPassword;

      // Store the updated user object back into IndexedDB
      return addToDB(user, "users", username, "put");
    })
    .then(function () {
      // Display a success message
      showPasswordToast();

      // Reset the form and display user details
      currentPasswordInput.value = "";
      newPasswordInput.value = "";
      confirmNewPasswordInput.value = "";
      document.getElementById("user-details").style.display = "block";
      document.getElementById("change-password-form").style.display = "none";
    })
    .catch(function (error) {
      console.error("Error changing password:", error);
      passwordChangeError.textContent = "An error occurred while changing the password.";
    });
}

function isValidPassword(password) {
  // Password should be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one digit
  if (password === "") return true;

  var passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+<>?])[A-Za-z\d!@#$%^&*()_+<>?]{8,}$/;
  return passwordRegex.test(password);
}

function showPasswordToast() {
  var passwordToast = document.getElementById("password-toast");
  passwordToast.classList.add("show");

  setTimeout(function () {
    passwordToast.classList.remove("show");
  }, 5000); // Adjust the timeout (in milliseconds) based on how long you want the toast to be visible
}
