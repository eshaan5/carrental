function logout() {
  // Remove the current user from local storage
  localStorage.removeItem("currentUser");

  // Redirect to the login page
  window.history.replaceState({}, document.title, "login.html");
  window.location.href = "login.html";
}

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
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
