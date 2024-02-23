if (!JSON.parse(localStorage.getItem("currentUser"))) {
  // User not logged in, redirect to login page
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function () {
  displayCars();
});

var id;
var currentDate = new Date().toISOString().split("T")[0]; // Current date in YYYY-MM-DD format

function displayCars() {
  var carsContainer = document.getElementById("cars-container");
  carsContainer.innerHTML = ""; // Clear previous results

  getAllDocuments("cars")
    .then(function (cars) {
      // Filter out cars with isDeleted property set to true
      var activeCars = cars.filter(function (car) {
        return !car.isDeleted;
      });

      activeCars.forEach(function (car) {
        var carCard = createCarCard(car);
        carsContainer.appendChild(carCard);
      });
    })
    .catch(function (error) {
      console.error("Error displaying cars:", error);
    });
}

function createCarCard(car) {
  var carCard = document.createElement("div");
  carCard.classList.add("car-card");

  // Add car image
  var carImage = document.createElement("img");
  carImage.src = car.image;
  carImage.alt = car.carName;
  carCard.appendChild(carImage);

  // Display car information
  carCard.innerHTML += `
    <div class="car-details">
      <p><strong>Number:</strong> ${car.number}</p>
      <p><strong>Name:</strong> ${car.carName}</p>
      <p><strong>Model:</strong> ${car.carModel}</p>
      <p><strong>Year:</strong> ${car.carYear}</p>
      <p><strong>Rent Amount:</strong> ₹${car.rentAmount} per day</p>
    </div>
    <div class="action-icons">
      <i class="fas fa-edit" onclick="openCarUpdateModal('${car.number}')"></i>
      <i class="fas fa-trash-alt" onclick="deleteCar('${car.number}')"></i>
    </div>
    <button class="show-bookings-btn" onclick="showBookings('${car.number}')">Show Bookings</button>
  `;

  return carCard;
}

function deleteCar(carNumber) {
  // Implement logic to mark the car as deleted in IndexedDB
  // Update local storage and re-display the cars

  getByKey(String(carNumber), "cars").then(function (car) {
    var toDelete = true;

    // check if car has any bookings
    getAllDocumentsByIndex("cid", car.number, "bookings")
      .then(function (bookings) {
        bookings.some(function (booking) {
          if (new Date(booking.endDate) > new Date()) {
            toDelete = false;
          }
        });

        if (!toDelete) {
          alert("Car has active bookings. Cannot delete.");
          return;
        }

        var res = confirm(`Car with number ${carNumber} will be marked as deleted?`);

        if (!res) return;

        // Mark the car as deleted by updating its isDeleted property
        car.isDeleted = true;

        // Update the car in IndexedDB
        addToDB(car, "cars", carNumber, "put")
          .then(function () {
            // Re-display the cars
            displayCars();
          })
          .catch(function (error) {
            console.error("Error updating car:", error);
          });
      })
      .catch(function (error) {
        console.error("Error retrieving car:", error);
      });
  });
}

function openCarUpdateModal(carNumber) {
  id = carNumber;
  var carUpdateModal = document.getElementById("car-update-modal");
  carUpdateModal.style.display = "block";
}

function closeCarUpdateModal() {
  var carUpdateModal = document.getElementById("car-update-modal");
  carUpdateModal.style.display = "none";

  // Reset input fields on modal close
  document.getElementById("new-image").value = "";
  document.getElementById("new-rent").value = "";
}

function updateCar() {
  var carNumber = id;

  // Retrieve the car object from IndexedDB
  getByKey(String(carNumber), "cars")
    .then(function (car) {
      var newImageInput = document.getElementById("new-image");
      var newRentInput = document.getElementById("new-rent");

      // Basic validation
      if (!newImageInput.files[0] && !newRentInput.value) {
        alert("Please provide at least one detail to update.");
        return;
      }

      if (newRentInput.value <= 0) {
        alert("Rent amount should be greater than 0.");
        return;
      }

      var newRent = newRentInput.value || car.rentAmount;

      // Read the new image file as a data URL
      var reader = new FileReader();
      reader.onload = function (e) {
        var newImageDataURL = e.target.result;

        // Update car details
        car.image = newImageDataURL;
        car.rentAmount = newRent;

        // Update car in IndexedDB
        addToDB(car, "cars", carNumber, "put")
          .then(function () {
            // Close the update modal and display the updated cars
            closeCarUpdateModal();
            displayCars();
          })
          .catch(function (error) {
            console.error("Error updating car:", error);
          });
      };

      // Check if a new image file is provided
      if (newImageInput.files[0]) {
        reader.readAsDataURL(newImageInput.files[0]);
      } else {
        // Update car details
        car.rentAmount = newRent;

        // Update car in IndexedDB
        addToDB(car, "cars", carNumber, "put")
          .then(function () {
            // Close the update modal and display the updated cars
            closeCarUpdateModal();
            displayCars();
          })
          .catch(function (error) {
            console.error("Error updating car:", error);
          });
      }
    })
    .catch(function (error) {
      console.error("Error retrieving car:", error);
    });
}

function showToast() {
  var passwordToast = document.getElementById("password-toast");
  passwordToast.classList.add("show");

  setTimeout(function () {
    passwordToast.classList.remove("show");
  }, 3000); // Adjust the timeout (in milliseconds) based on how long you want the toast to be visible
}

// Rest of the code remains unchanged

function showBookings(carNumber) {
  // Implement logic to retrieve and display bookings for the selected car
  var bookingsModal = document.getElementById("bookings-modal");
  bookingsModal.style.display = "block";

  var bookingsList = document.getElementById("bookings-list");
  bookingsList.innerHTML = ""; // Clear previous results

  // Retrieve the car from IndexedDB
  getAllDocumentsByIndex("cid", carNumber, "bookings")
    .then(function (bookings) {
      if (!bookings.length) {
        bookingsList.innerHTML = "<p>No bookings found.</p>";
        return;
      }
      bookings.forEach(function (booking) {
        var bookingDetails = document.createElement("p");
        bookingDetails.textContent = `Booked by: ${booking.uid}, Start Date: ${booking.startDate}, End Date: ${booking.endDate}, Total Amount: ₹${booking.totalAmount}`;
        // Append the booking details to the bookings list
        bookingsList.appendChild(bookingDetails);
      });
    })
    .catch(function (error) {
      console.error("Error retrieving car:", error);
    });
}

function closeBookingsModal() {
  var bookingsModal = document.getElementById("bookings-modal");
  bookingsModal.style.display = "none";
}
