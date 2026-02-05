// api.js

// 🔥 IMPORTANT: Backend base URL (Render)
const API_BASE_URL = "https://hostelcare-backend.onrender.com/api";

/**
 * Helper function to call backend APIs
 * - Automatically attaches JWT token (if present)
 * - Supports cookies (credentials)
 * - Throws meaningful errors
 */
async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("hc_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  // Attach JWT token if available
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: "include" // IMPORTANT for cookies
  });

  let data = {};
  try {
    data = await response.json();
  } catch (err) {
    // response has no JSON body
  }

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}
