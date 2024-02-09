function logout() {
  // Remove the current user from local storage
  localStorage.removeItem("currentUser");

  // Redirect to the login page
  window.history.replaceState({}, document.title, "login.html");
  window.location.href = "login.html";
}

function generateUUID() {
  const chars = "0123456789abcdef";
  let uuid = "";
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      uuid += "-";
    } else if (i === 14) {
      uuid += "4";
    } else if (i === 19) {
      uuid += chars[(Math.random() * 4) | 8];
    } else {
      uuid += chars[Math.floor(Math.random() * 16)];
    }
  }
  return uuid;
}

function dateDiffInDays(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds

  const firstDate = new Date(date1);
  const secondDate = new Date(date2);

  const diffInMilliseconds = Math.abs(firstDate - secondDate);
  const diffInDays = Math.round(diffInMilliseconds / oneDay);

  return diffInDays;
}
