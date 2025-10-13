// ✅ Base API URL
const BASE_API_URL = "https://karyar-library-management-system.liara.run/api";

document.addEventListener("DOMContentLoaded", loadLoans);

// ----------------------------
// Helpers
// ----------------------------

function getToken() {
  const match = document.cookie.match(/(^| )token=([^;]+)/);
  return match ? match[2] : null;
}

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  if (!token) {
    window.location.href = "login.html";
    throw new Error("No token");
  }

  const res = await fetch(BASE_API_URL + endpoint, {
    headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) throw new Error("Request failed: " + res.status);
  return res.json();
}

// ----------------------------
// Load user loans
// ----------------------------

async function loadLoans() {
  const tbody = document.querySelector("tbody");
  const totalText = document.querySelector(".card-header span");
  const activeBox = document.querySelectorAll(".stat-card .stat-number")[0];
  const returnedBox = document.querySelectorAll(".stat-card .stat-number")[1];

  tbody.innerHTML = "<tr><td colspan='5'>Loading loans...</td></tr>";

  try {
    let loans = await apiFetch("/loans/my-loans");
if (!Array.isArray(loans)) {
  loans = loans.data || loans.loans || [];
}
    tbody.innerHTML = "";

    let activeCount = 0;
    let returnedCount = 0;

    if (!loans || loans.length === 0) {
      tbody.innerHTML = "<tr><td colspan='5'>No loans found.</td></tr>";
    }

    loans.forEach((loan) => {
      const book = loan.book || {};
      const active = !loan.returnedDate;
      if (active) activeCount++;
      else returnedCount++;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          <strong>${book.title || "Unknown Book"}</strong><br>
          <small style="color:#666;">ISBN: ${book.isbn || "N/A"}</small>
        </td>
        <td>${book.author || "Unknown"}</td>
        <td>${new Date(loan.borrowedDate).toLocaleDateString()}</td>
        <td><span class="status ${active ? "status-active" : "status-returned"}">
          ${active ? "Active" : "Returned"}
        </span></td>
        <td>
          ${
            active
              ? `<button class="btn btn-success btn-sm" data-id="${loan._id}">Return</button>`
              : `<button class="btn btn-secondary btn-sm" disabled>Returned</button>`
          }
        </td>
      `;
      tbody.appendChild(tr);
    });

    totalText.textContent = `Total: ${loans.length} loans`;
    activeBox.textContent = activeCount;
    returnedBox.textContent = returnedCount;

    document.querySelectorAll(".btn-success[data-id]").forEach((btn) => {
      btn.addEventListener("click", () => returnBook(btn.dataset.id));
    });
  } catch (err) {
    console.error("Loans load failed:", err);
    tbody.innerHTML = "<tr><td colspan='5'>Error loading loans.</td></tr>";
  }
}

// ----------------------------
// Return book
// ----------------------------

async function returnBook(loanId) {
  if (!confirm("Return this book?")) return;
  try {
    await apiFetch(`/loans/${loanId}/return`, { method: "POST" });
    alert("Book returned successfully!");
    loadLoans();
  } catch (err) {
    console.error("Return failed:", err);
    alert("Could not return book.");
  }
}

// ----------------------------
// Logout
// ----------------------------

document.addEventListener("DOMContentLoaded", () => {
  const logoutLink = document.querySelector('a[href="login.html"]');
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      window.location.href = "login.html";
    });
  }
});