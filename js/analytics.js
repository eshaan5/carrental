if (!localStorage.getItem("currentUser")) {
  // User not logged in, redirect to login page
  window.location.href = "login.html";
}

const currentDate = new Date().toISOString().split("T")[0]; // Current date in YYYY-MM-DD format

const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");

endDateInput.setAttribute("max", currentDate);
startDateInput.setAttribute("max", currentDate);

endDateInput.addEventListener("change", function () {
  startDateInput.setAttribute("max", this.value);
});

function sevenDaysAgo() {
  const date = new Date(currentDate);
  date.setDate(date.getDate() - 7);
  return date.toISOString().split("T")[0];
}

document.addEventListener("DOMContentLoaded", function () {
  // Load initial analytics on page load if needed
  document.getElementById("end-date").value = currentDate;
  document.getElementById("start-date").value = sevenDaysAgo();
  generateAnalytics();
});

const charts = [];

function getDatesBetween(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const dateArray = [];

  // Iterate through each day and push it to the array
  let currentDate = startDate;
  while (currentDate <= endDate) {
    dateArray.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dateArray;
}

function getBookings(startDate, endDate) {
  const bookings = JSON.parse(localStorage.getItem("bookings")).filter((booking) => {
    return booking.bookingDate >= startDate && booking.bookingDate <= endDate;
  });

  return bookings;
}

function generateAnalytics() {
  charts.forEach((chart) => {
    chart.destroy();
  });

  document.getElementById("secondary-container").scrollIntoView((behavior = "smooth"));

  document.getElementById("main-container").style.display = "flex";

  const startDate = document.getElementById("start-date").value || sevenDaysAgo();
  const endDate = document.getElementById("end-date").value;

  const dates = getDatesBetween(startDate, endDate);

  // Call functions to generate charts and statistics based on the selected date range
  generateDayWiseChart(startDate, endDate);
  generateBookingsChart(startDate, endDate, dates);
  generateTopRightSection(startDate, endDate, getBookings(startDate, endDate));
  generateBottomLeftSection(getBookings(startDate, endDate));
  generateBottomRightSection(getBookings(startDate, endDate));
}

function generateBookingsChart(startDate = sevenDaysAgo(), endDate, dates) {
  const bookingsChartContainer = document.getElementById("bookings-chart").getContext("2d");

  const bookings = JSON.parse(localStorage.getItem("bookings")).filter((booking) => {
    return booking.bookingDate >= startDate && booking.bookingDate <= endDate;
  });

  const bookingsPerDay = dates.map((date) => {
    return bookings.filter((booking) => booking.bookingDate === date).length;
  });

  const revenuePerDay = dates.map((date) => {
    return bookings
      .filter((booking) => booking.bookingDate === date)
      .reduce((total, booking) => {
        return total + booking.totalAmount;
      }, 0);
  });

  const data = {
    labels: dates,
    datasets: [
      {
        label: "Bookings per Day",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        data: bookingsPerDay,
      },
      {
        label: "Revenue per Day",
        type: "line", // Set the type to 'line' to overlay it as a line chart
        fill: false,
        borderColor: "rgba(255, 99, 132, 1)",
        data: revenuePerDay,
        yAxisID: "y-axis-revenue", // Assign it to a different y-axis
      },
    ],
  };

  const options = {
    scales: {
      yAxes: [
        {
          id: "y-axis-bookings",
          type: "linear",
          position: "left",
        },
        {
          id: "y-axis-revenue",
          type: "linear",
          position: "right",
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
    tooltips: {
      callbacks: {
        label: function (tooltipItem, data) {
          const datasetLabel = data.datasets[tooltipItem.datasetIndex].label || "";
          const value = tooltipItem.yLabel;
          return datasetLabel + ": " + value;
        },
      },
    },
  };

  const chart = new Chart(bookingsChartContainer, {
    type: "bar",
    data: data,
    options: options,
  });

  charts.push(chart);
}

function generateTopRightSection(startDate, endDate, bookings) {
  const totalRevenue = bookings.reduce((total, booking) => {
    return total + booking.totalAmount;
  }, 0);

  let totalLogins = 0;

  JSON.parse(localStorage.getItem("users")).forEach((user) => {
    if (user.username !== "admin") totalLogins += user.logins.filter((login) => login >= startDate && login <= endDate).length;
  });

  const totalSignups = JSON.parse(localStorage.getItem("users")).filter((user) => {
    return user.signupDate >= startDate && user.signupDate <= endDate;
  }).length;

  const conversionRate = totalLogins > 0 ? ((bookings.length / totalLogins) * 100).toFixed(2) : 0;

  const topRightSection = document.getElementById("top-right-section");
  topRightSection.innerHTML = `
        <div style="display: flex; gap: 2rem;">
        <div class="top-card" style="">
            <h3>Total Revenue:</h3>
            <p>${totalRevenue}</p>
        </div>
        <div class="top-card" style="">
            <h3>Total Logins:</h3>
            <p>${totalLogins}</p>
        </div>
        </div>
        <div style="display: flex; gap: 2rem;">
        <div class="top-card" style="">
            <h3>Total Signups:</h3>
            <p>${totalSignups}</p>
        </div>
        <div class="top-card" style="">
            <h3>Conversion Rate:</h3>
            <p>${conversionRate} %</p>
        </div>
        </div>
    `;
}

function generateBottomLeftSection(bookings) {
  const users = {};
  const cars = [];

  bookings.forEach((booking) => {
    users[booking.uid] ? (users[booking.uid] += booking.totalAmount) : (users[booking.uid] = booking.totalAmount);
  });

  bookings.forEach((booking) => {
    const car = JSON.parse(localStorage.getItem("cars")).find((car) => car.number === booking.cid);
    if (cars.findIndex((c) => c.number === car.number) === -1) {
      car.totalBookings = bookings.filter((booking) => booking.cid === car.number).length;
      cars.push(car);
    }
  });

  const usersArray = Object.entries(users);

  usersArray.sort((a, b) => b[1] - a[1]);
  cars.sort((a, b) => b.totalBookings - a.totalBookings);

  const topUsersTable = document.getElementById("top-users-table");
  const topCarsTable = document.getElementById("top-cars-table");

  // Display top 5 users based on revenue
  topUsersTable.innerHTML = `
        <tr>
            <th>User</th>
            <th>Total Revenue</th>
        </tr>
        ${usersArray
          .slice(0, 5)
          .map(
            (entry) => `
            <tr>
                <td>${entry[0]}</td>
                <td>${entry[1]}</td>
            </tr>
        `
          )
          .join("")}
    `;

  // Display top 3 cars based on bookings
  topCarsTable.innerHTML = `
        <tr>
            <th>Car</th>
            <th>Total Bookings</th>
        </tr>
        ${cars
          .slice(0, 3)
          .map(
            (car) => `
            <tr>
                <td>${car.name} ${car.model}</td>
                <td>${car.totalBookings}</td>
            </tr>
        `
          )
          .join("")}
    `;
}

function generateBottomRightSection(bookings) {
  const colors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF8C00",
    "#8B4513",
    "#1E90FF",
    "#FFD700",
    "#32CD32",
    "#FF6347",
    "#00FFFF",
    "#8A2BE2",
    "#8B0000",
    "#00FA9A",
    "#00FF7F",
    "#4682B4",
    "#FF4500",
    "#DC143C",
    "#00BFFF",
    "#6A5ACD",
    "#00FF00",
    "#8B008B",
    "#2F4F4F",
    "#A52A2A",
    "#8B0000",
    "#00008B",
    "#808000",
    "#1E90FF",
    "#FFD700",
    "#008080",
    "#FF6347",
    "#FF4500",
    "#32CD32",
    "#8A2BE2",
    "#00FF7F",
    "#8B4513",
    "#00BFFF",
    "#A52A2A",
    "#FF00FF",
    // ... add more colors as needed
  ];

  const bottomRightSectionContainer = document.getElementById("bottom-right").getContext("2d");

  const carWiseBookings = {};

  JSON.parse(localStorage.getItem("cars")).forEach((car) => {
    const carBookings = bookings.filter((booking) => booking.cid === car.number);
    carWiseBookings[car.name] ? (carBookings[car.name] += carBookings.length) : (carWiseBookings[car.name] = carBookings.length);
  });

  const percentValues = Object.values(carWiseBookings).map((value) => ((value / bookings.length) * 100).toFixed(2));

  // Example data - replace with actual data from local storage
  const data = {
    labels: Object.keys(carWiseBookings),
    datasets: [
      {
        data: percentValues,
        backgroundColor: colors,
      },
    ],
  };

  const chart = new Chart(bottomRightSectionContainer, {
    type: "pie",
    data: data,
  });
  charts.push(chart);
}

function dayWiseSales(startDate, endDate) {
  const dates = getDatesBetween(startDate, endDate);

  const labelArray = [];

  for (let i = 1; i <= Math.ceil(dates.length / 7); i++) {
    labelArray.push(`Occurence ${i}`);
  }

  const res = [[], [], [], [], [], [], []];

  dates.forEach((date) => {
    const day = new Date(date).getDay();

    const bookings = JSON.parse(localStorage.getItem("bookings")).filter((booking) => {
      return booking.bookingDate === date;
    });

    res[day].push(bookings.length);
  });

  res.forEach((day) => {
    while (day.length < labelArray.length) {
      day.push(0);
    }
  });
  return res;
}

function generateDayWiseChart(startDate, endDate) {
  const labelArray = [];

  for (let i = 0; i < Math.ceil(getDatesBetween(startDate, endDate).length / 7); i++) {
    labelArray.push(`Occurence ${i + 1}`);
  }

  const res = dayWiseSales(startDate, endDate);
  // Sample data for 7 line charts
  const datasets = [
    { label: "Sunday", data: res[0], borderColor: "rgba(255, 99, 132, 1)", fill: false },
    { label: "Monday", data: res[1], borderColor: "rgba(54, 162, 235, 1)", fill: false },
    { label: "Tuesday", data: res[2], borderColor: "rgba(255, 206, 86, 1)", fill: false },
    { label: "Wednesday", data: res[3], borderColor: "rgba(75, 192, 192, 1)", fill: false },
    { label: "Thursday", data: res[4], borderColor: "rgba(153, 102, 255, 1)", fill: false },
    { label: "Friday", data: res[5], borderColor: "rgba(255, 159, 64, 1)", fill: false },
    { label: "Saturday", data: res[6], borderColor: "rgba(255, 99, 71, 1)", fill: false },
  ];

  const data = {
    labels: labelArray,
    datasets: datasets,
  };

  const options = {
    scales: {
      x: {
        type: "category",
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  const config = {
    type: "line",
    data: data,
    options: options,
  };

  // Create the chart
  const ctx = document.getElementById("day-wise-chart").getContext("2d");
  const myLineChart = new Chart(ctx, config);
  charts.push(myLineChart);
}
