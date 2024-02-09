let user = localStorage.getItem("currentUser");
document.addEventListener("DOMContentLoaded", function () {
  checkObject();
});

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
  if (field.value === "") {
    document.getElementsByClassName("error")[index].innerText = "";
    return false;
  }

  if (!regex.test(field.value)) {
    document.getElementsByClassName("error")[index].innerText = message;
    return false;
  }
  document.getElementsByClassName("error")[index].innerText = "";
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

  getByKey(username.value, "users")
    .then((user) => {
      if (user) {
        document.getElementsByClassName("error")[4].innerText = "User already exists. Please login.";
        return;
      }

      // Save user information in IndexedDB
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

      return addToDB(newUser, "users", "username");
    })
    .then((user) => {
      if (user) {
        setTimeout(() => {
          document.getElementById("signup-form").reset();
          document.getElementById("signup-error").innerText = "";
          showToast();
          showLoginForm();
        }, 2000);
      }
    });
}

function login() {
  const credential = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  // Retrieve user from IndexedDB
  getByKey(credential, "users")
    .then((userByUsername) => {
      getByKey(credential, "users", "email")
        .then((userByEmail) => {
          const user = userByUsername || userByEmail;

          if (user && user.password === password) {
            // Successful login
            document.getElementById("login-error").innerText = "";

            // Store the current user's username in local storage
            localStorage.setItem("currentUser", user.username);

            // Update login timestamp
            user.logins.push(new Date().toISOString().split("T")[0]);
            addToDB(user, "users", "username", "put").then(() => {
              if (user.username === "admin") {
                window.history.replaceState({}, document.title, "admin.html");
                window.location.href = "admin.html";
              } else {
                // Redirect to the landing page
                window.history.replaceState({}, document.title, "landingPage.html");
                window.location.href = "landingPage.html";
              }
            });
          } else {
            // Invalid credentials
            document.getElementById("login-error").innerText = "Invalid username or password.";
          }
        })
        .catch((error) => {
          console.error("Error retrieving user by email:", error);
          document.getElementById("login-error").innerText = "Error during login. Please try again.";
        });
    })
    .catch((error) => {
      console.error("Error retrieving user by username:", error);
      document.getElementById("login-error").innerText = "Error during login. Please try again.";
    });
}
