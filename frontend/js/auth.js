// auth.js

// ===== storage helpers =====
function saveAuth(token, user) {
  localStorage.setItem("hc_token", token);
  localStorage.setItem("hc_user", JSON.stringify(user));
}

function getCurrentUser() {
  const raw = localStorage.getItem("hc_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getToken() {
  return localStorage.getItem("hc_token");
}

function clearAuth() {
  localStorage.removeItem("hc_token");
  localStorage.removeItem("hc_user");
}

// ===== role-based redirect =====
function redirectByRole(role) {
  if (role === "student") {
    window.location.href = "dashboard/student.html";
  } else if (role === "warden") {
    window.location.href = "dashboard/warden.html";
  } else if (role === "admin") {
    window.location.href = "dashboard/admin.html";
  } else {
    window.location.href = "dashboard/student.html";
  }
}

// ===== logout =====
function logout() {
  clearAuth();
  window.location.href = "/";
}

// ===== protect pages =====
function requireAuth(allowedRoles = []) {
  const user = getCurrentUser();
  const token = getToken();

  if (!user || !token) {
    window.location.href = "../index.html";
    return;
  }

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    redirectByRole(user.role);
  }
}

// ===== login form handling =====
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const errorMsg = document.getElementById("errorMsg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.textContent = "";

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      errorMsg.textContent = "Please enter email and password.";
      return;
    }

    try {
      // ✅ DO NOT JSON.stringify here
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: {
          email,
          password
        }
      });

      if (!data.token || !data.user) {
        throw new Error("Invalid server response.");
      }

      saveAuth(data.token, data.user);
      redirectByRole(data.user.role);

    } catch (err) {
      console.error("Login error:", err);
      errorMsg.textContent = err.message || "Login failed. Please try again.";
    }
  });
});
