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

const currentDateObject = new Date();
const currentDate = currentDateObject.toISOString().split("T")[0]; // Current date in YYYY-MM-DD format
const hours = currentDateObject.getHours().toString().padStart(2, "0"); // Ensure two digits for hours
const minutes = currentDateObject.getMinutes().toString().padStart(2, "0"); // Ensure two digits for minutes
const currentTime = `${hours}:${minutes}`;

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

function checkCarAvailabilityForRent(startRentDate, endRentDate, selectedCar) {
  // Retrieve existing cars using indexedDB
  return getAllDocuments("cars")
    .then((existingCars) => {
      // Find the selected car
      const selectedCarObject = existingCars.find((car) => car.number === selectedCar);

      if (!selectedCarObject) {
        // Selected car not found in the existing cars array
        return false;
      }

      const carBookingIds = selectedCarObject.bookings || [];

      // Map over booking IDs to get corresponding booking details
      const bookingPromises = carBookingIds.map((bookingId) => {
        return getByKey(bookingId, "bookings");
      });

      // Resolve all booking promises
      return Promise.all(bookingPromises)
        .then((carBookings) => {
          // Check if the selected period overlaps with any booking for the car
          const overlap = carBookings.some((booking) => {
            const bookingStartDate = booking.startDate;
            const bookingEndDate = booking.endDate;

            return endRentDate >= bookingStartDate && startRentDate <= bookingEndDate;
          });

          // If there is no overlap, the car is considered available for rent
          return !overlap;
        })
        .catch((error) => {
          console.error("Error getting bookings:", error);
          // Reject the promise if there is an error
          throw error;
        });
    })
    .catch((error) => {
      console.error("Error getting cars:", error);
      // Reject the promise if there is an error
      throw error;
    });
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

function checkCarAvailability() {
  getAllDocuments("cars")
    .then((cars) => {
      return getAvailableCars(cars, startDateInput.value, endDateInput.value);
    })
    .then((availableCars) => {
      console.log("Available cars:", availableCars);
      displayAvailableCars(availableCars);
    });
}

function getAvailableCars(cars, startDate, endDate) {
  return new Promise((resolve, reject) => {
    const availableCarsPromises = cars.map((car) => {
      const carBookingIds = car.bookings || [];

      // Map over booking IDs to get corresponding booking details
      const bookingPromises = carBookingIds.map((bookingId) => {
        return getByKey(bookingId, "bookings");
      });

      // Resolve all booking promises
      return Promise.all(bookingPromises)
        .then((carBookings) => {
          // Check if the selected period overlaps with any booking for the car
          const overlap = carBookings.some((booking) => {
            const bookingStartDate = booking.startDate;
            const bookingEndDate = booking.endDate;
            return endDate >= bookingStartDate && startDate <= bookingEndDate;
          });

          // If there is no overlap, the car is considered available
          return !overlap;
        })
        .catch((error) => {
          console.error("Error getting bookings:", error);
          // Reject the promise if there is an error
          return false;
        });
    });

    // Resolve the promise with the array of available cars
    Promise.all(availableCarsPromises)
      .then((results) => {
        const availableCars = cars.filter((car, index) => results[index]);
        resolve(availableCars);
      })
      .catch((error) => {
        reject(error); // Reject the promise if there is an error
      });
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

function confirmRentNow() {
  const username = localStorage.getItem("currentUser");

  if (!username) {
    // Handle the case where the username is not available
    alert("Error: User not logged in");
    return;
  }

  const startRentDate = rentStartDateInput.value;
  const endRentDate = rentEndDateInput.value;

  const bookingObject = {
    id: generateUUID(),
    startDate: startRentDate,
    endDate: endRentDate,
    uid: username,
    cid: selectedCar,
    totalAmount: totalRent,
    bookingDate: currentDate,
    bookingTime: currentTime,
  };

  // Update bookings array in IndexedDB
  let newBookingId;
  addToDB(bookingObject, "bookings", bookingObject.id, "put")
    .then((bookingId) => {
      newBookingId = bookingId.id;
      // Retrieve existing cars from IndexedDB
      return getByKey(selectedCar, "cars");
    })
    .then((car) => {
      if (car) {
        // Update bookings array in the selected car
        car.bookings = car.bookings || [];
        car.bookings.push(newBookingId);

        return addToDB(car, "cars", car.number, "put");
      }
    })
    .then(() => {
      // Retrieve existing users from IndexedDB
      return getByKey(username, "users");
    })
    .then((currentUser) => {
      if (currentUser) {
        // Update bookings array in the user's profile
        currentUser.bookings = currentUser.bookings || [];
        currentUser.bookings.push(newBookingId);

        return addToDB(currentUser, "users", username, "put");
      }
    })
    .then(() => {
      // Close the modal after confirmation
      closeRentNowModal();

      // Display a success message or perform any additional actions
      return showPasswordToast();
    })
    .then(() => {
      window.location.href = "bookings.html";
    })
    .catch((error) => {
      console.error("Error confirming rent:", error);
      // Handle errors appropriately
    });
}

function closeRentNowModal() {
  const rentNowModal = document.getElementById("rent-now-modal");
  rentNowModal.style.display = "none";
}
