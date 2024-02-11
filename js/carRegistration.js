if (!localStorage.getItem("currentUser")) {
  // User not logged in, redirect to login page
  window.location.href = "login.html";
}

function showToast() {
  const passwordToast = document.getElementById("password-toast");
  passwordToast.classList.add("show");

  setTimeout(() => {
    window.location.href = "admin.html";
    passwordToast.classList.remove("show");
  }, 3000); // Adjust the timeout (in milliseconds) based on how long you want the toast to be visible
}

let formValid = false; // Variable to track form validity

// Event listeners for input fields to show errors dynamically
document.getElementById("car-name").addEventListener("input", () => {
  const carNameInput = document.getElementById("car-name");
  const formErrors = document.getElementById("form-errors");
  if (!carNameInput.value.trim()) {
    formErrors.textContent = "Please enter car name.";
    formValid = false; // Set formValid to false if error exists
  } else {
    formErrors.textContent = "";
    formValid = true; // Set formValid to true if no error exists
  }
  toggleSaveButton(); // Call function to toggle save button
});

document.getElementById("car-number").addEventListener("input", () => {
  const carNumberInput = document.getElementById("car-number");
  const formErrors = document.getElementById("form-errors");
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

document.getElementById("car-model").addEventListener("input", () => {
  const carModelInput = document.getElementById("car-model");
  const formErrors = document.getElementById("form-errors");
  if (!carModelInput.value.trim()) {
    formErrors.textContent = "Please enter car model.";
    formValid = false;
  } else {
    formErrors.textContent = "";
    formValid = true;
  }
  toggleSaveButton();
});

document.getElementById("car-year").addEventListener("input", () => {
  const carYearInput = document.getElementById("car-year");
  const formErrors = document.getElementById("form-errors");
  const currentYear = new Date().getFullYear();
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

document.getElementById("rent-amount").addEventListener("input", () => {
  const rentAmountInput = document.getElementById("rent-amount");
  const formErrors = document.getElementById("form-errors");
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

document.getElementById("car-image-upload").addEventListener("change", () => {
  const carImageUploadInput = document.getElementById("car-image-upload");
  const formErrors = document.getElementById("form-errors");
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
  const saveButton = document.getElementById("save-button");
  if (formValid) {
    saveButton.disabled = false; // Enable save button if form is valid
  } else {
    saveButton.disabled = true; // Disable save button if form is invalid
  }
}

function saveCarDetails() {
  const carNameInput = document.getElementById("car-name");
  const carNumberInput = document.getElementById("car-number");
  const carModelInput = document.getElementById("car-model");
  const carYearInput = document.getElementById("car-year");
  const carImageUploadInput = document.getElementById("car-image-upload");
  const rentAmountInput = document.getElementById("rent-amount");
  const formErrors = document.getElementById("form-errors");

  const carName = carNameInput.value;
  const carNumber = carNumberInput.value;
  const carModel = carModelInput.value;
  const carYear = carYearInput.value;
  const rentAmount = rentAmountInput.value;

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
  getByKey(carNumber, "cars").then((car) => {
    if (car) {
      // Display an error message if a car with the same number already exists
      formErrors.textContent = "A car with the same number already exists in the database. Add another Car!";
      return;
    }
    formErrors.textContent = ""; // Clear errors if any

    // Get the uploaded image file
    const imageFile = carImageUploadInput.files[0];

    // Read the image file as a data URL
    const reader = new FileReader();
    reader.onload = function (e) {
      const imageDataURL = e.target.result;

      // Create a new car object
      const newCar = {
        name: carName,
        number: carNumber,
        model: carModel,
        year: carYear,
        image: imageDataURL,
        rentAmount: rentAmount,
      };

      // Add the new car to the array
      addToDB(newCar, "cars").then((car) => {
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
