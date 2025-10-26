const BASE_API_URL = "https://karyar-library-management-system.liara.run/api";

function getToken() {
  const match = document.cookie.match(/(^| )token=([^;]+)/);
  return match ? match[2] : null;
}

function clearToken() {
  document.cookie = "token=; path=/; max-age=0";
}

async function loadDashboard() {
  const token = getToken();
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const booksRes = await fetch(`${BASE_API_URL}/books`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!booksRes.ok) throw new Error("Failed to load books");

    const booksData = await booksRes.json();

    const firstName = user.firstName || "Student";
    const lastName = user.lastName || "";
    const loansCount = user.activeLoansCount ?? 0;
    const booksCount = Array.isArray(booksData) ? booksData.length : 0;

    document.getElementById("studentName").textContent = firstName;
    document.getElementById("userName").textContent = `${firstName} ${lastName}`;
    document.getElementById("userAvatar").textContent = firstName.charAt(0).toUpperCase();
    document.getElementById("activeLoans").textContent = loansCount;
    document.getElementById("availableBooks").textContent = booksCount;

  } catch (err) {
    console.error("Dashboard load failed:", err);
    if (err.message.includes("401") || err.message.includes("token")) {
      clearToken();
      window.location.href = "login.html";
    } else {
      alert("Can't load this page please try again.");
    }
  }
}

function setupLogout() {
  const logoutLink = document.getElementById("logoutLink");
  logoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    clearToken();
    window.location.href = "login.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupLogout();
  loadDashboard();
});
