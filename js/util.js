function logout() {
    // Remove the current user from local storage
    localStorage.removeItem("currentUser");
  
    // Redirect to the login page
    window.history.replaceState({}, document.title, "login.html");
    window.location.href = "login.html";
  }
  