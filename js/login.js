let user = localStorage.getItem("currentUser");

if (user) {
  user === "admin" ? (window.location.href = "admin.html") : (window.location.href = "landingPage.html");
}

const firstName = document.getElementById("first-name");
const lastName = document.getElementById("last-name");
const email = document.getElementById("email");
const username = document.getElementById("username");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirm-password");
const phone = document.getElementById("phone");

firstName.addEventListener("input", function () {
  document.getElementById("signup-error").innerText = "";
  document.getElementsByClassName("error")[0].innerText = "";
  if (!regexTest(/^[a-zA-Z]+$/, firstName, "First name should only contain letters.", 0)) return;
});

lastName.addEventListener("input", function () {
  document.getElementById("signup-error").innerText = "";
  document.getElementsByClassName("error")[1].innerText = "";
  if (!regexTest(/^[a-zA-Z]+$/, lastName, "Last name should only contain letters.", 1)) return;
});

email.addEventListener("input", function () {
  document.getElementById("signup-error").innerText = "";
  document.getElementsByClassName("error")[2].innerText = "";
  if (!regexTest(/^[a-zA-Z\d][^\s@]+@[^\s@]+\.[a-zA-Z]+$/, email, "Invalid email address.", 2)) return;
});

phone.addEventListener("input", function () {
  document.getElementById("signup-error").innerText = "";
  document.getElementsByClassName("error")[3].innerText = "";
  if (!regexTest(/^\d{10}$/, phone, "Invalid phone number. Please enter a 10-digit number.", 3)) return;
});

password.addEventListener("input", function () {
  document.getElementById("signup-error").innerText = "";
  document.getElementsByClassName("error")[5].innerText = "";
  if (!regexTest(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+<>?])[A-Za-z\d!@#$%^&*()_+<>?]{8,}$/, password, "Invalid password. It should have at least one uppercase letter, one lowercase letter, one digit, and one special character.", 5)) return;
});

confirmPassword.addEventListener("input", function () {
  document.getElementById("signup-error").innerText = "";
  document.getElementsByClassName("error")[6].innerText = "";
  if (password.value !== confirmPassword.value) {
    document.getElementsByClassName("error")[6].innerText = "Passwords do not match.";

    return;
  }
});

document.getElementById("signup-error").innerText = "";

function showSignupForm() {
  document.getElementById("signup-container").style.display = "block";
  document.getElementById("login-container").style.display = "none";
}

function showLoginForm() {
  document.getElementById("signup-container").style.display = "none";
  document.getElementById("login-container").style.display = "block";
}

function regexTest(regex, field, message, index = 6) {
  if (!regex.test(field.value)) {
    document.getElementsByClassName("error")[index].innerText = message;
    return false;
  }

  return true;
}

function showToast() {
  const passwordToast = document.getElementById("password-toast");
  passwordToast.classList.add("show");

  setTimeout(() => {
    passwordToast.classList.remove("show");
  }, 3000); // Adjust the timeout (in milliseconds) based on how long you want the toast to be visible
}

function signup() {
  // Check if only small and capital letters are allowed for first name
  if (!regexTest(/^[a-zA-Z]+$/, firstName, "First name should only contain letters.")) return;
  if (!regexTest(/^[a-zA-Z]+$/, lastName, "Last name should only contain letters.")) return;

  // Check if email has exactly one @ and at least one .
  if (!regexTest(/^[a-zA-Z\d][^\s@]+@[^\s@]+\.[a-zA-Z]+$/, email, "Invalid email address.")) return;

  // Check if phone number is exactly 10 digits
  if (!regexTest(/^\d{10}$/, phone, "Invalid phone number. Please enter a 10-digit number.")) return;

  // Check if password meets the criteria
  if (!regexTest(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+<>?])[A-Za-z\d!@#$%^&*()_+<>?]{8,}$/, password, "Invalid password. It should have at least one uppercase letter, one lowercase letter, one digit, and one special character.")) return;

  // Check if both passwords match
  if (password.value !== confirmPassword.value) {
    document.getElementById("signup-error").innerText = "Passwords do not match.";
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];

  // Check if the username is already taken
  if (
    users.some(function (user) {
      return user.username === username.value || user.email === email.value;
    })
  ) {
    document.getElementsByClassName("error")[4].innerText = "User already exists. Please login.";
    return;
  }

  // Save user information in localStorage
  const newUser = {
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    username: username.value,
    password: password.value,
    phone: phone.value,
    registeredOn: new Date().toISOString().split("T")[0],
    logins: [],
  };

  console.log(newUser);

  // Add the new user to the users array
  users.push(newUser);

  // Save the updated users array in localStorage
  localStorage.setItem("users", JSON.stringify(users));

  // Clear form and display success message
  setTimeout(() => {
    document.getElementById("signup-form").reset();
    document.getElementById("signup-error").innerText = "";
    showToast();
    showLoginForm();
  }, 2000);
}

function login() {
  const credential = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  // Retrieve users array from localStorage
  const users = JSON.parse(localStorage.getItem("users")) || [];

  // Find the user with the entered username or email
  let user = users.find((u) => u.username === credential) || users.find((u) => u.email === credential);

  if (user && user.password === password) {
    // Successful login
    document.getElementById("login-error").innerText = "";

    // Store the current user's username in local storage
    localStorage.setItem("currentUser", user.username);

    const index = users.findIndex((u) => u.username == user.username);
    users[index].logins.push(new Date().toISOString().split("T")[0]);
    localStorage.setItem("users", JSON.stringify(users));

    if (user.username === "admin") {
      window.history.replaceState({}, document.title, "admin.html");
      window.location.href = "admin.html";
      return;
    }

    // Redirect to the landing page

    window.history.replaceState({}, document.title, "landingPage.html");
    window.location.href = "landingPage.html";
  } else {
    // Invalid credentials
    document.getElementById("login-error").innerText = "Invalid username or password.";
  }
}
