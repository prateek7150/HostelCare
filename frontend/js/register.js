// register.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  if (!form) return;

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const roomInput = document.getElementById("roomNumber");
  const msgEl = document.getElementById("registerMsg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    msgEl.textContent = "";
    msgEl.classList.remove("text-danger", "text-success");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const roomNumber = roomInput.value.trim();

    // Basic validation
    if (!name || !email || !password) {
      msgEl.textContent = "Please fill all required fields.";
      msgEl.classList.add("text-danger");
      return;
    }

    if (!roomNumber) {
      msgEl.textContent = "Room number is required.";
      msgEl.classList.add("text-danger");
      return;
    }

    try {
      // IMPORTANT: Do NOT JSON.stringify here
      const res = await apiRequest("/auth/register", {
        method: "POST",
        body: {
          name,
          email,
          password,
          role: "student",
          roomNumber
        }
      });

      msgEl.textContent = res.message || "Registration successful. Redirecting...";
      msgEl.classList.add("text-success");

      // Redirect to login page
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1200);

    } catch (err) {
      console.error("Register error:", err);
      msgEl.textContent = err.message || "Registration failed.";
      msgEl.classList.add("text-danger");
    }
  });
});
