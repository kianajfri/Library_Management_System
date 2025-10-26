const API_URL = "https://karyar-library-management-system.liara.run/api";

function saveToken(token) {
  document.cookie = `token=${token}; path=/; max-age=${24 * 60 * 60}`;
}

function getToken() {
  const match = document.cookie.match(/(^| )token=([^;]+)/);
  return match ? match[2] : null;
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const alertBox = document.getElementById("alert-container");

  if (getToken()) {
    window.location.href = "dashboard.html";
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    alertBox.innerHTML = "Loading...";

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alertBox.innerHTML = `<div class="alert error">${data.message || "Login failed"}</div>`;
        return;
      }

      saveToken(data.token);

      delete data.user.password
      localStorage.setItem("user", JSON.stringify(data.user));

      window.location.href = "dashboard.html";
    } catch (err) {
      alertBox.innerHTML = `<div class="alert error">${err.message}</div>`;
    }
  });
});
