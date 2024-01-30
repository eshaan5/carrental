if (!localStorage.getItem("currentUser")) {
  // User not logged in, redirect to login page
  window.location.href = "login.html";
}

function showToast() {
  const passwordToast = document.getElementById("password-toast");
  passwordToast.classList.add("show");

  setTimeout(() => {
    passwordToast.classList.remove("show");
  }, 3000); // Adjust the timeout (in milliseconds) based on how long you want the toast to be visible
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

  // Retrieve existing cars from local storage
  const existingCars = JSON.parse(localStorage.getItem("cars")) ?? [];

  // Check if there's already a car with the same number
  const carWithSameNumber = existingCars.find((car) => car.number === carNumber);

  if (carWithSameNumber) {
    // Display an error message if a car with the same number already exists
    formErrors.textContent = "A car with the same number already exists in the database. Add another Car!";
    return;
  } else {
    formErrors.textContent = ""; // Clear errors if any
  }

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
    existingCars.push(newCar);

    // Save the updated array back to local storage
    localStorage.setItem("cars", JSON.stringify(existingCars));

    // Optionally, display a success message or redirect to another page
    showToast();

    // Clear the form
    carNameInput.value = "";
    carModelInput.value = "";
    carYearInput.value = "";
    carImageUploadInput.value = "";
    rentAmountInput.value = "";
    carNumberInput.value = "";
  };

  reader.readAsDataURL(imageFile);
}
