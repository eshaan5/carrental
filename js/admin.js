if (!localStorage.getItem("currentUser")) {
  // User not logged in, redirect to login page
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function () {
  displayCars();
});

let id;
const currentDate = new Date().toISOString().split("T")[0]; // Current date in YYYY-MM-DD format

function displayCars() {
  const carsContainer = document.getElementById("cars-container");
  carsContainer.innerHTML = ""; // Clear previous results

  const cars = JSON.parse(localStorage.getItem("cars")) ?? [];

  cars.forEach((car) => {
    const carCard = createCarCard(car);
    carsContainer.appendChild(carCard);
  });
}

function createCarCard(car) {
  const carCard = document.createElement("div");
  carCard.classList.add("car-card");

  // Add car image
  const carImage = document.createElement("img");
  carImage.src = car.image;
  carImage.alt = car.name;
  carCard.appendChild(carImage);

  // Display car information
  carCard.innerHTML += `
    <p><strong>Number:</strong> ${car.number}</p>
        <p><strong>Name:</strong> ${car.name}</p>
        <p><strong>Model:</strong> ${car.model}</p>
        <p><strong>Year:</strong> ${car.year}</p>
        <p><strong>Rent Amount:</strong> ₹${car.rentAmount} per day</p>
        <button onclick="deleteCar(${car.number})">Delete</button>
        <button onclick="openCarUpdateModal(${car.number})">Update</button>
        <button onclick="showBookings(${car.number})">Show Bookings</button>
    `;

  return carCard;
}

function deleteCar(carNumber) {
  // Implement logic to delete the car with the given number
  // Update local storage and re-display the cars

  const cars = JSON.parse(localStorage.getItem("cars")) || [];
  const car = cars.find((car) => car.number == carNumber);

  let cantDelete = false;

  if (car.bookings) {
    car.bookings.forEach((bid) => {
      const booking = JSON.parse(localStorage.getItem("bookings")).find((booking) => booking.id == bid);
      if (booking.endDate >= currentDate) cantDelete = true;
    });
  }

  if (cantDelete) {
    alert(`Car with number ${carNumber} can't be deleted, as it is currently in use`);
    return;
  }

  const res = confirm(`Car with number ${carNumber} will be deleted?`);

  if (!res) return;

  const newCars = cars.filter((car) => car.number != carNumber);
  localStorage.setItem("cars", JSON.stringify(newCars));
  displayCars();
}

function openCarUpdateModal(carNumber) {
  id = carNumber;
  const carUpdateModal = document.getElementById("car-update-modal");
  carUpdateModal.style.display = "block";
}

function closeCarUpdateModal() {
  const carUpdateModal = document.getElementById("car-update-modal");
  carUpdateModal.style.display = "none";

  // Reset input fields on modal close
  document.getElementById("new-image").value = "";
  document.getElementById("new-rent").value = "";
}

function updateCar() {
  const carNumber = id;

  const car = JSON.parse(localStorage.getItem("cars")).filter((car) => car.number == carNumber)[0] || null;

  const newImageInput = document.getElementById("new-image");
  const newRentInput = document.getElementById("new-rent");
  const carUpdateModal = document.getElementById("car-update-modal");

  // Basic validation
  if (!newImageInput.files[0] && !newRentInput.value) {
    alert("Please provide at least one detail to update.");
    return;
  }

  if (newRentInput.value <= 0) {
    alert("Rent amount should be greater than 0.");
    return;
  }

  const newRent = newRentInput.value || car.rentAmount;

  // Read the new image file as a data URL
  const reader = new FileReader();
  reader.onload = function (e) {
    const newImageDataURL = e.target.result;

    // Update car details
    updateCarDetails(carNumber, newImageDataURL, newRent);

    // Close the update modal and display the updated cars
    closeCarUpdateModal();
    displayCars();
  };

  // Check if a new image file is provided
  if (newImageInput.files[0]) {
    reader.readAsDataURL(newImageInput.files[0]);
  } else {
    // Update car details
    updateCarDetails(carNumber, car.image, newRent);

    // Close the update modal and display the updated cars
    closeCarUpdateModal();
    displayCars();
  }
}

function showToast() {
  const passwordToast = document.getElementById("password-toast");
  passwordToast.classList.add("show");

  setTimeout(() => {
    passwordToast.classList.remove("show");
  }, 3000); // Adjust the timeout (in milliseconds) based on how long you want the toast to be visible
}

function updateCarDetails(carNumber, newImageDataURL, newRentValue) {
  const cars = JSON.parse(localStorage.getItem("cars")) || [];
  const selectedCar = cars.find((car) => car.number == carNumber);

  if (selectedCar) {
    // Update car details based on the provided values
    if (newImageDataURL) {
      selectedCar.image = newImageDataURL;
    }

    if (newRentValue) {
      selectedCar.rentAmount = newRentValue;
    }

    // Save the updated car array back to local storage
    localStorage.setItem("cars", JSON.stringify(cars));
    showToast();
  } else {
    alert("Car not found. Please try again.");
  }
}

// Rest of the code remains unchanged

function showBookings(carNumber) {
  // Implement logic to retrieve and display bookings for the selected car
  const bookingsModal = document.getElementById("bookings-modal");
  bookingsModal.style.display = "block";

  const bookingsList = document.getElementById("bookings-list");
  bookingsList.innerHTML = ""; // Clear previous results

  const cars = JSON.parse(localStorage.getItem("cars")) || [];
  const selectedCar = cars.find((car) => car.number == carNumber);

  if (selectedCar && selectedCar.bookings) {
    selectedCar.bookings.forEach((bookingId) => {
      const booking = getBookingById(bookingId);
      if (booking) {
        const bookingDetails = document.createElement("p");
        bookingDetails.textContent = `Booking ID: ${booking.id}, Start Date: ${booking.startDate}, End Date: ${booking.endDate}, Total Amount: ₹${booking.totalAmount}`;
        bookingsList.appendChild(bookingDetails);
      }
    });
  }
}

function getBookingById(bookingId) {
  // Implement logic to retrieve the booking details by ID from local storage
  const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  return bookings.find((booking) => booking.id == bookingId);
}

function closeBookingsModal() {
  const bookingsModal = document.getElementById("bookings-modal");
  bookingsModal.style.display = "none";
}
