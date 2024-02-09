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

  getAllDocuments("cars")
    .then((cars) => {
      // Filter out cars with isDeleted property set to true
      const activeCars = cars.filter((car) => !car.isDeleted);

      activeCars.forEach((car) => {
        const carCard = createCarCard(car);
        carsContainer.appendChild(carCard);
      });
    })
    .catch((error) => {
      console.error("Error displaying cars:", error);
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
    <div class="car-details">
      <p><strong>Number:</strong> ${car.number}</p>
      <p><strong>Name:</strong> ${car.name}</p>
      <p><strong>Model:</strong> ${car.model}</p>
      <p><strong>Year:</strong> ${car.year}</p>
      <p><strong>Rent Amount:</strong> ₹${car.rentAmount} per day</p>
    </div>
    <div class="action-icons">
      <i class="fas fa-edit" onclick="openCarUpdateModal(${car.number})"></i>
      <i class="fas fa-trash-alt" onclick="deleteCar(${car.number})"></i>
    </div>
    <button class="show-bookings-btn" onclick="showBookings(${car.number})">Show Bookings</button>
  `;

  return carCard;
}

function deleteCar(carNumber) {
  // Implement logic to mark the car as deleted in IndexedDB
  // Update local storage and re-display the cars

  getByKey(String(carNumber), "cars")
    .then((car) => {
      let cantDelete = false;

      if (car.bookings) {
        const currentDate = new Date().toISOString().split("T")[0];
        car.bookings.forEach((bid) => {
          getByKey(bid, "bookings").then((booking) => {
            if (booking.endDate >= currentDate) cantDelete = true;
          });
        });
      }

      if (cantDelete) {
        alert(`Car with number ${carNumber} can't be deleted, as it is currently in use`);
        return;
      }

      const res = confirm(`Car with number ${carNumber} will be marked as deleted?`);

      if (!res) return;

      // Mark the car as deleted by updating its isDeleted property
      car.isDeleted = true;

      // Update the car in IndexedDB
      addToDB(car, "cars", carNumber, "put")
        .then(() => {
          // Re-display the cars
          displayCars();
        })
        .catch((error) => {
          console.error("Error updating car:", error);
        });
    })
    .catch((error) => {
      console.error("Error retrieving car:", error);
    });
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

  // Retrieve the car object from IndexedDB
  getByKey(String(carNumber), "cars")
    .then((car) => {
      console.log(car);
      const newImageInput = document.getElementById("new-image");
      const newRentInput = document.getElementById("new-rent");

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
        car.image = newImageDataURL;
        car.rentAmount = newRent;

        // Update car in IndexedDB
        addToDB(car, "cars", carNumber, "put")
          .then(() => {
            // Close the update modal and display the updated cars
            closeCarUpdateModal();
            displayCars();
          })
          .catch((error) => {
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
          .then(() => {
            // Close the update modal and display the updated cars
            closeCarUpdateModal();
            displayCars();
          })
          .catch((error) => {
            console.error("Error updating car:", error);
          });
      }
    })
    .catch((error) => {
      console.error("Error retrieving car:", error);
    });
}

function showToast() {
  const passwordToast = document.getElementById("password-toast");
  passwordToast.classList.add("show");

  setTimeout(() => {
    passwordToast.classList.remove("show");
  }, 3000); // Adjust the timeout (in milliseconds) based on how long you want the toast to be visible
}

// Rest of the code remains unchanged

function showBookings(carNumber) {
  // Implement logic to retrieve and display bookings for the selected car
  const bookingsModal = document.getElementById("bookings-modal");
  bookingsModal.style.display = "block";

  const bookingsList = document.getElementById("bookings-list");
  bookingsList.innerHTML = ""; // Clear previous results

  // Retrieve the car from IndexedDB
  getByKey(String(carNumber), "cars")
    .then((selectedCar) => {
      if (selectedCar && selectedCar.bookings) {
        // Loop through each booking ID associated with the car
        selectedCar.bookings.forEach((bookingId) => {
          // Retrieve the booking details from IndexedDB using the booking ID
          getByKey(bookingId, "bookings")
            .then((booking) => {
              if (booking) {
                // Create a paragraph element to display booking details
                const bookingDetails = document.createElement("p");
                bookingDetails.textContent = `Booking ID: ${booking.id}, Start Date: ${booking.startDate}, End Date: ${booking.endDate}, Total Amount: ₹${booking.totalAmount}`;
                // Append the booking details to the bookings list
                bookingsList.appendChild(bookingDetails);
              }
            })
            .catch((error) => {
              console.error("Error retrieving booking:", error);
            });
        });
      }
    })
    .catch((error) => {
      console.error("Error retrieving car:", error);
    });
}

function closeBookingsModal() {
  const bookingsModal = document.getElementById("bookings-modal");
  bookingsModal.style.display = "none";
}
