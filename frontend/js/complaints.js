// js/complaints.js

// Submit a new complaint
document.getElementById("complaintForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const category = document.getElementById("category").value;

  if (!title || !description || !category) {
    alert("All fields are required.");
    return;
  }

  try {
    await apiRequest("/complaints", {
      method: "POST",
      body: { title, description, category }
    });

    alert("Complaint submitted successfully!");
    document.getElementById("complaintForm").reset();
    loadMyComplaints();

  } catch (err) {
    console.error("Error submitting complaint:", err);
    alert(err.message || "Failed to submit complaint.");
  }
});


// Fetch and render student’s complaints
async function loadMyComplaints() {
  try {
    const data = await apiRequest("/complaints/my");

    const tableBody = document.querySelector("#complaintsTable tbody");
    tableBody.innerHTML = "";

    if (!data.complaints || data.complaints.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center">No complaints found.</td>
        </tr>
      `;
      return;
    }

    data.complaints.forEach(c => {
      const row = `
        <tr>
          <td>${c.title}</td>
          <td>${c.description}</td>
          <td>${c.category}</td>
          <td><span class="badge bg-${statusColor(c.status)}">${c.status}</span></td>
          <td>${new Date(c.createdAt).toLocaleString()}</td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });

  } catch (err) {
    console.error("Error loading complaints:", err);
    alert(err.message || "Error loading complaints.");
  }
}


// Helper: map status to Bootstrap badge color
function statusColor(status) {
  switch (status) {
    case "pending": return "warning";
    case "in-progress": return "info";
    case "resolved": return "success";
    default: return "secondary";
  }
}


// Load complaints on page load
window.addEventListener("DOMContentLoaded", loadMyComplaints);
