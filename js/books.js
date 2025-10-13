// ✅ Base API URL
const BASE_API_URL = "https://karyar-library-management-system.liara.run/api";

document.addEventListener("DOMContentLoaded", loadBooks);

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
// Load books
// ----------------------------

async function loadBooks() {
  const container = document.querySelector(".grid");
  container.innerHTML = "<p>Loading books...</p>";

  try {
   let books = await apiFetch("/books");
if (!Array.isArray(books)) {
  books = books.data || books.books || [];
}
    container.innerHTML = "";
    books.forEach((book) => {
      const card = document.createElement("div");
      card.className = "card";

      const available = book.availableCopies > 0;
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:1rem;">
          <h3 style="margin:0;color:#2c3e50;">${book.title}</h3>
          <span class="status ${available ? "status-available" : "status-unavailable"}">
            ${available ? "Available" : "Unavailable"}
          </span>
        </div>
        <p><strong>Author:</strong> ${book.author || "Unknown"}</p>
        <p><strong>ISBN:</strong> ${book.isbn || "N/A"}</p>
        <p><strong>Category:</strong> ${book.category?.name || "N/A"}</p>
        <p><strong>Available Copies:</strong> ${book.availableCopies}</p>
        <p style="font-size:0.9rem;color:#555;margin-bottom:1rem;">${book.description || ""}</p>
        <div style="display:flex;gap:0.5rem;">
          <button class="btn btn-primary btn-sm" ${!available ? "disabled" : ""} data-id="${book._id}">
            ${available ? "Borrow Book" : "Not Available"}
          </button>
          <button class="btn btn-secondary btn-sm" onclick="viewDetails('${book._id}')">View Details</button>
        </div>
      `;
      container.appendChild(card);
    });

    document.querySelectorAll(".btn-primary[data-id]").forEach((btn) => {
      btn.addEventListener("click", () => borrowBook(btn.dataset.id));
    });
  } catch (err) {
    console.error("Books load failed:", err);
    container.innerHTML = "<p>Failed to load books. Please try again.</p>";
  }
}

// ----------------------------
// Borrow book
// ----------------------------

async function borrowBook(bookId) {
  if (!confirm("Borrow this book?")) return;

  try {
    await apiFetch("/loans", {
      method: "POST",
      body: JSON.stringify({ bookId }),
    });
    alert("Book borrowed successfully!");
    loadBooks(); // reload after borrowing
  } catch (err) {
    console.error("Borrow failed:", err);
    alert("Could not borrow book.");
  }
}

// ----------------------------
// View book details
// ----------------------------

function viewDetails(bookId) {
  alert("Book details page not implemented yet. (Book ID: " + bookId + ")");
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
