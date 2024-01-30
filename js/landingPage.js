// Example static list of cars and their availability
if (!localStorage.getItem("currentUser")) {
  // User not logged in, redirect to login page
  window.location.href = "login.html";
}

const cars = JSON.parse(localStorage.getItem("cars")) || [];

const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const rentStartDateInput = document.getElementById("rent-start-date");
const rentEndDateInput = document.getElementById("rent-end-date");

const currentDate = new Date().toISOString().split("T")[0]; // Current date in YYYY-MM-DD format

document.addEventListener("DOMContentLoaded", () => {
  currentDateObject = new Date(currentDate);
  // Increment the day by 1
  currentDateObject.setDate(currentDateObject.getDate() + 1);

  // Get the next date in ISO format
  const nextDate = currentDateObject.toISOString().split("T")[0];
  startDateInput.value = currentDate;
  endDateInput.value = nextDate;
  checkCarAvailability(currentDate, nextDate);
});

startDateInput.addEventListener("input", verifyDates);
endDateInput.addEventListener("input", verifyDates);

rentStartDateInput.addEventListener("input", updateRent);
rentEndDateInput.addEventListener("input", updateRent);

let rentAmount, selectedCar, totalRent;

function updateRent() {
  // Check for the availability first
  const availabilityError = document.getElementById("availability-error");
  const confirmButton = document.getElementById("confirm");

  const rentTotalParagraph = document.getElementById("rent-total");
  const startRentDate = rentStartDateInput.value;
  const endRentDate = rentEndDateInput.value;

  if (startRentDate < currentDate) {
    availabilityError.textContent = "Start date should not be behind the current date.";
    rentTotalParagraph.textContent = ""; // Clear total rent display
    confirmButton.disabled = true; // Disable the confirm button
    return;
  }

  if (startRentDate >= endRentDate) {
    availabilityError.textContent = "Start date should not be greater than end date.";
    rentTotalParagraph.textContent = ""; // Clear total rent display
    confirmButton.disabled = true; // Disable the confirm button
    return;
  }

  const isCarAvailable = checkCarAvailabilityForRent(startRentDate, endRentDate);

  if (!isCarAvailable) {
    availabilityError.textContent = "Car is not available for the selected period.";
    rentTotalParagraph.textContent = ""; // Clear total rent display
    confirmButton.disabled = true; // Disable the confirm button
  } else {
    availabilityError.textContent = ""; // Clear availability error if car is available
    totalRent = dateDiffInDays(endRentDate, startRentDate) * rentAmount;
    rentTotalParagraph.textContent = `Total Rent: ${dateDiffInDays(endRentDate, startRentDate)} days * ₹${rentAmount} = ₹${totalRent}`;
    confirmButton.disabled = false; // Enable the confirm button
  }

  // Open the modal
  const rentNowModal = document.getElementById("rent-now-modal");
  rentNowModal.style.display = "block";
}

function checkCarAvailabilityForRent(startRentDate, endRentDate) {
  // Retrieve existing cars from local storage
  const existingCars = JSON.parse(localStorage.getItem("cars")) || [];

  // Find the selected car
  const selectedCarObject = existingCars.find((car) => car.number === selectedCar);

  if (!selectedCarObject) {
    // Selected car not found in the existing cars array
    return false;
  }

  const carBookingIds = selectedCarObject.bookings || [];

  // Map over booking IDs to get corresponding booking details
  const carBookings = carBookingIds.map((bookingId) => {
    // Assuming bookings array structure is stored in local storage
    const allBookings = JSON.parse(localStorage.getItem("bookings")) || [];
    return allBookings.find((booking) => booking.id === bookingId);
  });

  // Check if the selected period overlaps with any booking for the car
  const overlap = carBookings.some((booking) => {
    const bookingStartDate = booking.startDate;
    const bookingEndDate = booking.endDate;

    return endRentDate >= bookingStartDate && startRentDate <= bookingEndDate;
  });

  // If there is no overlap, the car is considered available for rent
  return !overlap;
}

function verifyDates() {
  const startDateError = document.getElementById("start-date-error");
  const endDateError = document.getElementById("end-date-error");

  const startDate = startDateInput.value;
  const endDate = endDateInput.value;

  // Basic checks for start date

  if (startDate < currentDate) {
    startDateError.textContent = "Start date should not be behind the current date.";
    endDateError.textContent = ""; // Clear end date error
    startDateInput.value = currentDate;
    return;
  } else {
    startDateError.textContent = ""; // Clear start date error
  }

  if (startDate >= endDate) {
    endDateError.textContent = "Start date should not be greater than end date.";
    startDateError.textContent = ""; // Clear start date error
    const startDateObject = new Date(startDate);
    startDateObject.setDate(startDateObject.getDate() + 1); // Increment the day by 1
    endDateInput.value = startDateObject.toISOString().split("T")[0];
    return;
  } else {
    endDateError.textContent = ""; // Clear end date error
  }
}

let availableCars = [];

function checkCarAvailability() {
  availableCars = getAvailableCars(startDateInput.value, endDateInput.value);

  displayAvailableCars(availableCars);
}

function getAvailableCars(startDate, endDate) {
  // Filter cars based on availability
  return cars.filter((car) => {
    const carBookingIds = car.bookings || [];

    // Map over booking IDs to get corresponding booking details
    const carBookings = carBookingIds.map((bookingId) => {
      // Assuming bookings array structure is stored in local storage
      const allBookings = JSON.parse(localStorage.getItem("bookings")) || [];
      return allBookings.find((booking) => booking.id === bookingId);
    });

    // Check if the selected period overlaps with any booking for the car
    const overlap = carBookings.some((booking) => {
      const bookingStartDate = booking.startDate;
      const bookingEndDate = booking.endDate;

      return endDate >= bookingStartDate && startDate <= bookingEndDate;
    });

    // If there is no overlap, the car is considered available
    return !overlap;
  });
}

// ... (previous JavaScript code) ...

// Add these variables to track pagination
let currentPage = 1;
const carsPerPage = 5;

// Update the displayAvailableCars function
function displayAvailableCars(availableCars) {
  const availableCarsContainer = document.getElementById("available-cars");
  availableCarsContainer.innerHTML = ""; // Clear previous results

  if (availableCars.length === 0) {
    availableCarsContainer.innerHTML = "<p>No cars available for the selected period.</p>";
  } else {
    const startIndex = (currentPage - 1) * carsPerPage;
    const endIndex = startIndex + carsPerPage;
    const displayedCars = availableCars.slice(startIndex, endIndex);

    displayedCars.forEach((car) => {
      // Create a card for each available car
      const carCard = document.createElement("div");
      carCard.classList.add("car-card");

      // Display car information
      carCard.innerHTML = `
        <img src="${car.image}" alt="${car.name}">
        <p><strong>Name:</strong> ${car.name}</p>
        <p><strong>Model:</strong> ${car.model}</p>
        <p><strong>Year:</strong> ${car.year}</p>
        <p><strong>Rent Amount:</strong> ${car.rentAmount} per day</p>
        <button onclick="openRentNowModal('${car.name}', '${car.model}', ${car.rentAmount}, '${car.number}')">Rent Now</button>
      `;

      // Append the card to the container
      availableCarsContainer.appendChild(carCard);
    });

    updatePaginationInfo();
  }
}

// Add these functions for pagination
function changePage(change) {
  currentPage += change;
  if (currentPage < 1) {
    currentPage = 1;
  } else {
    const maxPage = Math.ceil(availableCars.length / carsPerPage);
    if (currentPage > maxPage) {
      currentPage = maxPage;
    }
  }

  displayAvailableCars(getAvailableCars(startDateInput.value, endDateInput.value));
}

function updatePaginationInfo() {
  const pageInfo = document.getElementById("page-info");
  const maxPage = Math.ceil(cars.length / carsPerPage);
  pageInfo.textContent = `Page ${currentPage} of ${maxPage}`;
}

// ... (remaining JavaScript code) ...

function openRentNowModal(name, model, rent, number) {
  rentStartDateInput.value = startDateInput.value;
  rentEndDateInput.value = endDateInput.value;

  const carDetails = document.getElementById("car-details");

  carDetails.textContent = `Your Car: ${name} ${model}`;
  rentAmount = rent;
  selectedCar = number;

  updateRent();
}

function showPasswordToast() {
  const passwordToast = document.getElementById("password-toast");
  passwordToast.classList.add("show");

  return new Promise((resolve) => {
    setTimeout(() => {
      passwordToast.classList.remove("show");
      resolve();
    }, 3000); // Adjust the timeout (in milliseconds) based on how long you want the toast to be visible
  });
}

function closeRentNowModal() {
  const rentNowModal = document.getElementById("rent-now-modal");
  rentNowModal.style.display = "none";
}

function confirmRentNow() {
  const username = localStorage.getItem("currentUser");

  if (!username) {
    // Handle the case where the username is not available
    alert("Error: User not logged in");
    return;
  }

  const existingBookings = JSON.parse(localStorage.getItem("bookings")) || [];
  const bookingsArrayKey = "bookings"; // Adjust the key based on your structure

  const newBookingId = existingBookings.length > 0 ? existingBookings[existingBookings.length - 1].id + 1 : 1;

  const startRentDate = rentStartDateInput.value;
  const endRentDate = rentEndDateInput.value;

  const bookingObject = {
    id: newBookingId,
    startDate: startRentDate,
    endDate: endRentDate,
    uid: username,
    cid: selectedCar,
    totalAmount: totalRent,
    bookingDate: currentDate,
  };

  // Update bookings array in local storage
  existingBookings.push(bookingObject);
  localStorage.setItem(bookingsArrayKey, JSON.stringify(existingBookings));

  // Retrieve existing cars from local storage
  const existingCars = JSON.parse(localStorage.getItem("cars")) || [];

  // Find the selected car
  const selectedCarObject = existingCars.find((car) => car.number === selectedCar);

  if (selectedCarObject) {
    // Update bookings array in the selected car
    selectedCarObject.bookings = selectedCarObject.bookings || [];
    selectedCarObject.bookings.push(newBookingId);

    // Update the car in the cars array
    const updatedCarsArray = existingCars.map((car) => (car.number === selectedCar ? selectedCarObject : car));
    localStorage.setItem("cars", JSON.stringify(updatedCarsArray));
  }

  // Retrieve existing users from local storage
  const existingUsers = JSON.parse(localStorage.getItem("users")) || [];

  // Find the current user
  const currentUser = existingUsers.find((user) => user.username === username);

  if (currentUser) {
    // Update bookings array in the user's profile
    currentUser.bookings = currentUser.bookings || [];
    currentUser.bookings.push(newBookingId);

    // Update the user in the users array
    const updatedUsersArray = existingUsers.map((user) => (user.username === username ? currentUser : user));
    localStorage.setItem("users", JSON.stringify(updatedUsersArray));
  }

  // Close the modal after confirmation
  closeRentNowModal();

  // Display a success message or perform any additional actions
  showPasswordToast().then(() => {
    window.location.href = "bookings.html";
  });
}

function dateDiffInDays(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds

  const firstDate = new Date(date1);
  const secondDate = new Date(date2);

  const diffInMilliseconds = Math.abs(firstDate - secondDate);
  const diffInDays = Math.round(diffInMilliseconds / oneDay);

  return diffInDays;
}
