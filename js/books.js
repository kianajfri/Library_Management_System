const BASE_API_URL = "https://karyar-library-management-system.liara.run/api";

document.addEventListener("DOMContentLoaded", loadBooks);

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

async function loadBooks() {
  const container = document.querySelector(".grid");
  container.innerHTML = "<p>Loading books...</p>";

  const user = JSON.parse(localStorage.getItem("user"));

  
    const firstName = user.firstName || "Student";
    const lastName = user.lastName || "";

    document.getElementById("userName").textContent = `${firstName} ${lastName}`;
    document.getElementById("userAvatar").textContent = firstName.charAt(0).toUpperCase();

  try {
    let response = await apiFetch("/books");
    let books = response.data;
    console.log(books)

    container.innerHTML = "";
    books.forEach((book) => {
      const available = book.availableCopies > 0;

      const card = document.createElement("div");
      card.className = "card";

      const tagsHTML = (book.tags || [])
        .map(tag => `<span class="tag">${tag}</span>`)
        .join(" ");

      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:1rem;">
          <h3 style="margin:0;color:#2c3e50;">${book.title}</h3>
          <span class="status ${available ? "status-available" : "status-unavailable"}">
            ${available ? "Available" : "Unavailable"}
          </span>
        </div>
        <p><strong>Author:</strong> ${book.author || "Unknown"}</p>
        <p><strong>Publisher:</strong> ${book.publisher || "N/A"}</p>
        <p><strong>Year:</strong> ${book.publicationYear || "N/A"}</p>
        <p><strong>ISBN:</strong> ${book.isbn || "N/A"}</p>
        <p><strong>Category:</strong> ${book.category?.name || "N/A"}</p>
        <p><strong>Available Copies:</strong> ${book.availableCopies}</p>
        <p><strong>Borrowed Copies:</strong> ${book.borrowedCopies}</p>
        <p style="font-size:0.9rem;color:#555;margin-bottom:1rem;">${book.description || ""}</p>
        
        ${tagsHTML ? `<div class="tags" style="margin-bottom:1rem;">${tagsHTML}</div>` : ""}

        <div style="display:flex;gap:0.5rem;">
          <button class="btn btn-primary btn-sm" ${!available ? "disabled" : ""} data-id="${book.id}">
            ${available ? "Borrow Book" : "Not Available"}
          </button>
          <button class="btn btn-secondary btn-sm" onclick="viewDetails('${book.id}')">View Details</button>
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

async function borrowBook(bookId) {
  const days = prompt("How many days do you want to borrow this book?");
  if (!days || isNaN(days) || days <= 0) {
    alert("Please enter a valid number of days.");
    return;
  }

  const token = getToken();
  if (!token) {
    alert("You are not logged in!");
    window.location.href = "login.html";
    return;
  }

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user.id;
  if (!userId) {
    alert("User ID not found. Please log in again.");
    window.location.href = "login.html";
    return;
  }

  const loanPeriod = parseInt(days);
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + loanPeriod);

  try {
    await apiFetch("/loans", {
      method: "POST",
      body: JSON.stringify({
        bookId,
        userId,
        loanPeriod,
        dueDate: dueDate.toISOString(),
      }),
    });

    alert(`Book borrowed for ${loanPeriod} days successfully!`);
    loadBooks();
  } catch (err) {
    console.error("Borrow failed:", err);
    alert("Could not borrow book.");
  }
}
