if (!localStorage.getItem("currentUser")) {
  // User not logged in, redirect to login page
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function () {
  // Retrieve the current user from local storage
  const currentUser = localStorage.getItem("currentUser");

  // Retrieve the user's bookings from local storage
  const bookings = JSON.parse(localStorage.getItem("bookings")) || [];

  // Separate upcoming and previous trips
  const upcomingTrips = bookings.filter((booking) => booking.uid === currentUser && new Date(booking.startDate) > new Date());

  const previousTrips = bookings.filter((booking) => booking.uid === currentUser && new Date(booking.startDate) <= new Date());

  // Display upcoming and previous trips
  displayTrips("upcoming-trips-list", upcomingTrips);
  displayTrips("previous-trips-list", previousTrips);
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

      // Customize the display as needed
      tripElement.innerHTML = `
                <p><strong>Booking ID:</strong> ${trip.id}</p>
                <div>${getCarDetails(trip.cid)}</div>
                <p><strong>Start Date:</strong> ${trip.startDate}</p>
                <p><strong>End Date:</strong> ${trip.endDate}</p>
                <!-- Add more details as needed -->

            `;

      container.appendChild(tripElement);
    });
  }
}

function getCarDetails(carNumber) {
  // Retrieve the car details based on the carNumber
  // You can modify this function based on how your cars are stored
  const cars = JSON.parse(localStorage.getItem("cars")) || [];
  const car = cars.find((car) => car.number === carNumber);

  return car
    ? `<img src=${car.image} />
    <p><strong>Car:</strong> ${car.name} ${car.model} (${car.year})</p>
    `
    : "Car details not available";
}
