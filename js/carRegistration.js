if (!JSON.parse(localStorage.getItem("currentUser"))) {
  // User not logged in, redirect to login page
  window.location.href = "login.html";
}

function showToast() {
  var passwordToast = document.getElementById("password-toast");
  passwordToast.classList.add("show");

  setTimeout(function () {
    window.location.href = "admin.html";
    passwordToast.classList.remove("show");
  }, 3000); // Adjust the timeout (in milliseconds) based on how long you want the toast to be visible
}

var formValid = false; // Variable to track form validity

// Event listeners for input fields to show errors dynamically
document.getElementById("car-name").addEventListener("input", function () {
  var carNameInput = document.getElementById("car-name");
  var formErrors = document.getElementById("form-errors");
  if (!carNameInput.value.trim()) {
    formErrors.textContent = "Please enter car name.";
    formValid = false; // Set formValid to false if error exists
  } else {
    formErrors.textContent = "";
    formValid = true; // Set formValid to true if no error exists
  }
  toggleSaveButton(); // Call function to toggle save button
});

document.getElementById("car-number").addEventListener("input", function () {
  var carNumberInput = document.getElementById("car-number");
  var formErrors = document.getElementById("form-errors");
  if (!carNumberInput.value.trim()) {
    formErrors.textContent = "Please enter car number.";
    formValid = false;
  } else if (!carNumberInput.value.match(/^[a-zA-Z0-9]+$/)) {
    formErrors.textContent = "Car number should be an alphanumeric string.";
    formValid = false;
  } else {
    formErrors.textContent = "";
    formValid = true;
  }
  toggleSaveButton();
});

document.getElementById("car-model").addEventListener("input", function () {
  var carModelInput = document.getElementById("car-model");
  var formErrors = document.getElementById("form-errors");
  if (!carModelInput.value.trim()) {
    formErrors.textContent = "Please enter car model.";
    formValid = false;
  } else {
    formErrors.textContent = "";
    formValid = true;
  }
  toggleSaveButton();
});

document.getElementById("car-year").addEventListener("input", function () {
  var carYearInput = document.getElementById("car-year");
  var formErrors = document.getElementById("form-errors");
  var currentYear = new Date().getFullYear();
  if (!carYearInput.value.trim()) {
    formErrors.textContent = "Please enter car year.";
    formValid = false;
  } else if (isNaN(carYearInput.value) || carYearInput.value <= 0) {
    formErrors.textContent = "Car year should be a valid number greater than 0.";
    formValid = false;
  } else if (carYearInput.value > currentYear) {
    formErrors.textContent = "Car year should be less than or equal to current year.";
    formValid = false;
  } else {
    formErrors.textContent = "";
    formValid = true;
  }
  toggleSaveButton();
});

document.getElementById("rent-amount").addEventListener("input", function () {
  var rentAmountInput = document.getElementById("rent-amount");
  var formErrors = document.getElementById("form-errors");
  if (!rentAmountInput.value.trim()) {
    formErrors.textContent = "Please enter rent amount.";
    formValid = false;
  } else if (isNaN(rentAmountInput.value) || rentAmountInput.value <= 0) {
    formErrors.textContent = "Rent amount should be a valid number greater than 0.";
    formValid = false;
  } else {
    formErrors.textContent = "";
    formValid = true;
  }
  toggleSaveButton();
});

document.getElementById("car-image-upload").addEventListener("change", function () {
  var carImageUploadInput = document.getElementById("car-image-upload");
  var formErrors = document.getElementById("form-errors");
  if (!carImageUploadInput.files[0]) {
    formErrors.textContent = "Please upload an image.";
    formValid = false;
  } else {
    formErrors.textContent = "";
    formValid = true;
  }
  toggleSaveButton();
});

// Function to toggle save button based on form validity
function toggleSaveButton() {
  var saveButton = document.getElementById("save-button");
  if (formValid) {
    saveButton.disabled = false; // Enable save button if form is valid
  } else {
    saveButton.disabled = true; // Disable save button if form is invalid
  }
}

function saveCarDetails() {
  var carNameInput = document.getElementById("car-name");
  var carNumberInput = document.getElementById("car-number");
  var carModelInput = document.getElementById("car-model");
  var carYearInput = document.getElementById("car-year");
  var carImageUploadInput = document.getElementById("car-image-upload");
  var rentAmountInput = document.getElementById("rent-amount");
  var formErrors = document.getElementById("form-errors");

  var carName = carNameInput.value;
  var carNumber = carNumberInput.value;
  var carModel = carModelInput.value;
  var carYear = carYearInput.value;
  var rentAmount = rentAmountInput.value;

  // Basic validation
  if (!carName || !carModel || !carYear || !carImageUploadInput.files[0] || !rentAmount || !carNumber) {
    formErrors.textContent = "Please fill in all fields and upload an image.";
    return;
  } else {
    formErrors.textContent = ""; // Clear errors if any
  }

  if (rentAmount <= 0) {
    formErrors.textContent = "Rent amount should be greater than 0.";
    return;
  } else {
    formErrors.textContent = ""; // Clear errors if any
  }

  if (carYear > new Date().getFullYear()) {
    formErrors.textContent = "Car year should be less than or equal to current year.";
    return;
  } else {
    formErrors.textContent = ""; // Clear errors if any
  }

  // Check if there's already a car with the same number
  getByKey(carNumber, "cars").then(function (car) {
    if (car) {
      // Display an error message if a car with the same number already exists
      if (!car.isDeleted) {
        formErrors.textContent = "A car with the same number already exists in the database. Add another Car!";
        return;
      }
    }
    formErrors.textContent = ""; // Clear errors if any

    // Get the uploaded image file
    var imageFile = carImageUploadInput.files[0];

    // Read the image file as a data URL
    var reader = new FileReader();
    reader.onload = function (e) {
      var imageDataURL = e.target.result;

      // Create a new car object
      var newCar = {
        carName: carName,
        number: carNumber,
        carModel: carModel,
        carYear: carYear,
        image: imageDataURL,
        rentAmount: rentAmount,
      };

      if (car && car.isDeleted) {
        addToDB(newCar, "cars", car.number, "put").then(function (car) {
          if (!car) {
            formErrors.textContent = "Failed to add car to database. Please try again.";
            return;
          }

          // Optionally, display a success message or redirect to another page
          showToast();

          // Clear the form
          carNameInput.value = "";
          carModelInput.value = "";
          carYearInput.value = "";
          carImageUploadInput.value = "";
          rentAmountInput.value = "";
          carNumberInput.value = "";
        });
        return;
      }

      // Add the new car to the array
      addToDB(newCar, "cars").then(function (car) {
        if (!car) {
          formErrors.textContent = "Failed to add car to database. Please try again.";
          return;
        }

        // Optionally, display a success message or redirect to another page
        showToast();

        // Clear the form
        carNameInput.value = "";
        carModelInput.value = "";
        carYearInput.value = "";
        carImageUploadInput.value = "";
        rentAmountInput.value = "";
        carNumberInput.value = "";
      });
    };

    reader.readAsDataURL(imageFile);
  });
}
