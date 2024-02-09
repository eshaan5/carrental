if (!localStorage.getItem("currentUser")) {
  // User not logged in, redirect to login page
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function () {
  // Retrieve the current user from local storage
  const currentUser = localStorage.getItem("currentUser");

  // Retrieve the user's bookings from IndexedDB
  getAllDocuments("bookings")
    .then((bookings) => {
      // Separate upcoming and previous trips
      const upcomingTrips = bookings.filter((booking) => booking.uid === currentUser && new Date(booking.startDate) > new Date());
      const previousTrips = bookings.filter((booking) => booking.uid === currentUser && new Date(booking.startDate) <= new Date());

      // Display upcoming and previous trips
      displayTrips("upcoming-trips-list", upcomingTrips);
      displayTrips("previous-trips-list", previousTrips);
    })
    .catch((error) => {
      console.error("Error loading user bookings:", error);
      // Handle error, such as displaying an error message to the user
    });
});

function showUpcoming() {
  document.getElementById("upcoming-trips").style.display = "block";
  document.getElementById("previous-trips").style.display = "none";
  document.getElementById("upcoming-a").classList.add("highlight");
  document.getElementById("previous-a").classList.remove("highlight");
}

function showPrevious() {
  document.getElementById("previous-trips").style.display = "block";
  document.getElementById("upcoming-trips").style.display = "none";
  document.getElementById("upcoming-a").classList.remove("highlight");
  document.getElementById("previous-a").classList.add("highlight");
}

function displayTrips(containerId, trips) {
  const container = document.getElementById(containerId);

  if (trips.length === 0) {
    container.innerHTML = "<p>No trips available.</p>";
  } else {
    container.innerHTML = "";

    trips.forEach((trip) => {
      const tripElement = document.createElement("div");
      tripElement.classList.add("trip-card");

      // Retrieve car details asynchronously
      getCarDetails(trip.cid)
        .then((carDetails) => {
          // Customize the display with car details
          tripElement.innerHTML = `
            <p><strong>Booking ID:</strong> ${trip.id}</p>
            <div>${carDetails}</div>
            <p><strong>Start Date:</strong> ${trip.startDate}</p>
            <p><strong>End Date:</strong> ${trip.endDate}</p>
            <p><strong>Price:</strong> ₹ ${trip.totalAmount}</p>
            <!-- Add more details as needed -->
          `;

          container.appendChild(tripElement);
        })
        .catch((error) => {
          console.error("Error displaying trip:", error);
          // Handle error, such as displaying an error message to the user
          tripElement.innerHTML = "<p>Error displaying trip details.</p>";
          container.appendChild(tripElement);
        });
    });
  }
}

function getCarDetails(carNumber) {
  // Retrieve the car details based on the carNumber from IndexedDB
  return getByKey(carNumber, "cars")
    .then((car) => {
      return car
        ? `<img src=${car.image} />
          <p><strong>Car:</strong> ${car.name} ${car.model} (${car.year})</p>`
        : "Car details not available";
    })
    .catch((error) => {
      console.error("Error retrieving car details:", error);
      // Handle error, such as displaying an error message to the user
      return "Error retrieving car details";
    });
}
