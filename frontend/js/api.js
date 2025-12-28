// api.js

const API_BASE_URL = `${window.location.protocol}//${window.location.host}/api`;

/**
 * Helper to call the backend.
 * Adds Authorization header if token is available.
 */
async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("hc_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include"
  });

  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    // no JSON body
  }

  if (!res.ok) {
    const message = data.message || "Something went wrong";
    throw new Error(message);
  }

  return data;
}
