if (!JSON.parse(localStorage.getItem("currentUser"))) {
  // User not logged in, redirect to login page
  window.location.href = "login.html";
}

if (JSON.parse(localStorage.getItem("currentUser")).username === "admin") {
  // Admin logged in, redirect to admin page
  window.location.href = "admin.html";
}

var startDateInput = document.getElementById("start-date");
var endDateInput = document.getElementById("end-date");
var rentStartDateInput = document.getElementById("rent-start-date");
var rentEndDateInput = document.getElementById("rent-end-date");

var currentDateObject = new Date();
var currentDate = currentDateObject.toISOString().split("T")[0]; // Current date in YYYY-MM-DD format
var hours = currentDateObject.getHours().toString().padStart(2, "0"); // Ensure two digits for hours
var minutes = currentDateObject.getMinutes().toString().padStart(2, "0"); // Ensure two digits for minutes
var currentTime = `${hours}:${minutes}`;

var availableCars = [];

document.addEventListener("DOMContentLoaded", () => {
  currentDateObject = new Date(currentDate);
  // Increment the day by 1
  currentDateObject.setDate(currentDateObject.getDate() + 1);

  // Get the next date in ISO format
  var nextDate = currentDateObject.toISOString().split("T")[0];
  startDateInput.value = currentDate;
  endDateInput.value = nextDate;
  checkCarAvailability(currentDate, nextDate);
});

startDateInput.addEventListener("input", verifyDates);
endDateInput.addEventListener("input", verifyDates);

rentStartDateInput.addEventListener("input", updateRent);
rentEndDateInput.addEventListener("input", updateRent);

var rentAmount,
  selectedCar = {},
  totalRent;

function updateRent() {
  // Check for the availability first
  var availabilityError = document.getElementById("availability-error");
  var confirmButton = document.getElementById("confirm");

  var rentTotalParagraph = document.getElementById("rent-total");
  var startRentDate = rentStartDateInput.value;
  var endRentDate = rentEndDateInput.value;

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

  var isCarAvailable = checkCarAvailabilityForRent(startRentDate, endRentDate);

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
  var rentNowModal = document.getElementById("rent-now-modal");
  rentNowModal.style.display = "block";
}

function checkCarAvailabilityForRent(startRentDate, endRentDate) {
  // Retrieve existing cars using indexedDB
  return getAllDocumentsByIndex("cid", selectedCar.number, "bookings")
    .then(function (carBookings) {
      // Find the selected car
      // Check if the selected period overlaps with any booking for the car
      var overlap = carBookings.some(function (booking) {
        var bookingStartDate = booking.startDate;
        var bookingEndDate = booking.endDate;

        return endRentDate >= bookingStartDate && startRentDate <= bookingEndDate;
      });

      // If there is no overlap, the car is considered available for rent
      return !overlap;
    })
    .catch(function (error) {
      console.error("Error getting cars:", error);
      // Reject the promise if there is an error
      throw error;
    });
}

function verifyDates() {
  var startDateError = document.getElementById("start-date-error");
  var endDateError = document.getElementById("end-date-error");

  var startDate = startDateInput.value;
  var endDate = endDateInput.value;

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
    var startDateObject = new Date(startDate);
    startDateObject.setDate(startDateObject.getDate() + 1); // Increment the day by 1
    endDateInput.value = startDateObject.toISOString().split("T")[0];
    return;
  } else {
    endDateError.textContent = ""; // Clear end date error
  }
}

function checkCarAvailability() {
  getAllDocuments("cars")
    .then(function (cars) {
      return getAvailableCars(cars, startDateInput.value, endDateInput.value);
    })
    .then(function (availableCars) {
      displayAvailableCars(availableCars);
    });
}

function getAvailableCars(cars, startDate, endDate) {
  return new Promise(function (resolve, reject) {
    var availableCarsPromises = cars.map(function (car) {
      return getAllDocumentsByIndex("cid", car.number, "bookings")
        .then(function (carBookings) {
          // Check if the selected period overlaps with any booking for the car
          var overlap = carBookings.some(function (booking) {
            var bookingStartDate = booking.startDate;
            var bookingEndDate = booking.endDate;
            return endDate >= bookingStartDate && startDate <= bookingEndDate;
          });

          // If there is no overlap, the car is considered available
          return !overlap;
        })
        .catch(function (error) {
          console.error("Error getting bookings:", error);
          // Reject the promise if there is an error
          return false;
        });
    });

    // Resolve the promise with the array of available cars
    Promise.all(availableCarsPromises)
      .then(function (results) {
        availableCars = cars.filter(function (car, index) {
          return results[index];
        });
        resolve(availableCars);
      })
      .catch(function (error) {
        reject(error); // Reject the promise if there is an error
      });
  });
}

// ... (previous JavaScript code) ...

// Add these variables to track pagination
var currentPage = 1;
var carsPerPage = 5;

// Update the displayAvailableCars function
function displayAvailableCars(availableCars) {
  console.log(availableCars);
  var availableCarsContainer = document.getElementById("available-cars");
  availableCarsContainer.innerHTML = ""; // Clear previous results

  if (availableCars.length === 0) {
    availableCarsContainer.innerHTML = "<p>No cars available for the selected period.</p>";
  } else {
    var startIndex = (currentPage - 1) * carsPerPage;
    var endIndex = startIndex + carsPerPage;
    var displayedCars = availableCars.slice(startIndex, endIndex);

    displayedCars.forEach(function (car) {
      // Create a card for each available car
      var carCard = document.createElement("div");
      carCard.classList.add("car-card");

      // Display car information
      carCard.innerHTML = `
        <img src="${car.image}" alt="${car.carName}">
        <p><strong>Name:</strong> ${car.carName}</p>
        <p><strong>Model:</strong> ${car.carModel}</p>
        <p><strong>Year:</strong> ${car.carYear}</p>
        <p><strong>Rent Amount:</strong> ₹ ${car.rentAmount} per day</p>
        <button onclick="openRentNowModal('${car.carName}', '${car.carModel}', ${car.rentAmount}, '${car.number}', '${car.image}', '${car.carYear}')">Rent Now</button>
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
    var maxPage = Math.ceil(availableCars.length / carsPerPage);
    if (currentPage > maxPage) {
      currentPage = maxPage;
    }
  }

  displayAvailableCars(availableCars, startDateInput.value, endDateInput.value);
}

function updatePaginationInfo() {
  var pageInfo = document.getElementById("page-info");
  var maxPage = Math.ceil(availableCars.length / carsPerPage);
  pageInfo.textContent = `Page ${currentPage} of ${maxPage}`;
}

// ... (remaining JavaScript code) ...

function openRentNowModal(name, model, rent, number, image, year) {
  rentStartDateInput.value = startDateInput.value;
  rentEndDateInput.value = endDateInput.value;

  var carDetails = document.getElementById("car-details");

  carDetails.textContent = `Your Car: ${name} ${model}`;
  rentAmount = rent;
  selectedCar = {
    carName: name,
    carModel: model,
    number: number,
    image: image,
    carYear: year,
  };
  console.log(selectedCar);

  updateRent();
}

function showPasswordToast() {
  var passwordToast = document.getElementById("password-toast");
  passwordToast.classList.add("show");

  return new Promise(function (resolve) {
    setTimeout(function () {
      passwordToast.classList.remove("show");
      resolve();
    }, 3000); // Adjust the timeout (in milliseconds) based on how long you want the toast to be visible
  });
}

function confirmRentNow() {
  var username = JSON.parse(localStorage.getItem("currentUser")).username;

  if (!username) {
    // Handle the case where the username is not available
    alert("Error: User not logged in");
    return;
  }

  var startRentDate = rentStartDateInput.value;
  var endRentDate = rentEndDateInput.value;
  console.log(selectedCar);

  var bookingObject = {
    id: generateUUID(),
    startDate: startRentDate,
    endDate: endRentDate,
    uid: username,
    cid: selectedCar.number,
    car: selectedCar,
    user: JSON.parse(localStorage.getItem("currentUser")),
    totalAmount: totalRent,
    bookingDate: currentDate,
    bookingTime: currentTime,
  };

  // Update bookings array in IndexedDB
  addToDB(bookingObject, "bookings", bookingObject.id, "put")
    .then(function () {
      // Close the modal after confirmation
      closeRentNowModal();

      // Display a success message or perform any additional actions
      return showPasswordToast();
    })
    .then(function () {
      window.location.href = "bookings.html";
    })
    .catch(function (error) {
      console.error("Error confirming rent:", error);
      // Handle errors appropriately
    });
}

function closeRentNowModal() {
  var rentNowModal = document.getElementById("rent-now-modal");
  rentNowModal.style.display = "none";
}
