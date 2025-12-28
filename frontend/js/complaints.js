// js/complaints.js

// Submit a new complaint
document.getElementById("complaintForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const category = document.getElementById("category").value;

  try {
    const res = await fetch("http://localhost:5000/api/complaints", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ title, description, category })
    });

    const data = await res.json();

    if (data.success) {
      alert("Complaint submitted successfully!");
      document.getElementById("complaintForm").reset();
      loadMyComplaints(); // refresh list
    } else {
      alert(data.message || "Failed to submit complaint.");
    }
  } catch (err) {
    alert("Error submitting complaint. Please try again.");
  }
});

// Fetch and render student’s complaints
async function loadMyComplaints() {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch("http://localhost:5000/api/complaints/my", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await res.json();

    if (data.success) {
      const tableBody = document.querySelector("#complaintsTable tbody");
      tableBody.innerHTML = "";

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
    } else {
      alert(data.message || "Failed to load complaints.");
    }
  } catch (err) {
    alert("Error loading complaints.");
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
window.onload = loadMyComplaints;