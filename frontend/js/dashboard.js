// dashboard.js

document.addEventListener("DOMContentLoaded", () => {
  // Only students should access this page
  requireAuth(["student"]);

  const user = getCurrentUser();
  const navRoleEl = document.getElementById("nav-role");

  if (user && navRoleEl) {
    navRoleEl.textContent = `Role: ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`;
  }

  // Elements
  const complaintForm = document.getElementById("complaintForm");
  const complaintsTableBody = document.querySelector("#complaintsTable tbody");
  const feedbackForm = document.getElementById("feedbackForm");
  const feedbackMsg = document.getElementById("feedbackMsg");

  // Load complaints initially
  if (user && complaintsTableBody) {
    loadStudentComplaints(user._id, complaintsTableBody);
  }

  // Handle complaint form submit
  if (complaintForm) {
    complaintForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const titleEl = document.getElementById("title");
      const descEl = document.getElementById("description");
      const categoryEl = document.getElementById("category");

      const title = titleEl.value.trim();
      const description = descEl.value.trim();
      const category = categoryEl.value;

      if (!title || !description) {
        alert("Please fill in both title and description.");
        return;
      }

      try {
        await apiRequest("/complaints", {
          method: "POST",
          body: JSON.stringify({ title, description, category })
        });

        // Clear form
        titleEl.value = "";
        descEl.value = "";
        categoryEl.value = "electricity";

        // Reload complaints
        if (user && complaintsTableBody) {
          await loadStudentComplaints(user._id, complaintsTableBody);
        }
      } catch (err) {
        console.error("Error submitting complaint:", err);
        alert(err.message || "Could not submit complaint.");
      }
    });
  }

  // Handle mess feedback form submit
  if (feedbackForm) {
    feedbackForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (feedbackMsg) {
        feedbackMsg.textContent = "";
        feedbackMsg.classList.remove("text-danger", "text-success");
      }

      const roomNumberEl = document.getElementById("roomNumber");
      const ratingEl = document.getElementById("rating");
      const commentEl = document.getElementById("comment");

      const roomNumber = roomNumberEl.value.trim();
      const rating = ratingEl.value;
      const comment = commentEl.value.trim();

      if (!roomNumber || !rating || !comment) {
        if (feedbackMsg) {
          feedbackMsg.textContent = "Please fill all feedback fields.";
          feedbackMsg.classList.add("text-danger");
        }
        return;
      }

      // 👇 NEW: derive studentName from logged-in user
      const studentName =
        (user && (user.name || user.fullName || user.email)) || "Student";

      try {
        await apiRequest("/feedback", {
          method: "POST",
          body: JSON.stringify({
            studentName,
            roomNumber,
            rating: Number(rating),
            comment
          })
        });

        // Clear form
        roomNumberEl.value = "";
        ratingEl.value = "";
        commentEl.value = "";

        if (feedbackMsg) {
          feedbackMsg.textContent = "Feedback submitted. Thank you!";
          feedbackMsg.classList.add("text-success");
        }
      } catch (err) {
        console.error("Error submitting feedback:", err);
        if (feedbackMsg) {
          feedbackMsg.textContent = err.message || "Could not submit feedback.";
          feedbackMsg.classList.add("text-danger");
        }
      }
    });
  }
});

/**
 * Load complaints for the current student and render into table body
 */
async function loadStudentComplaints(studentId, tableBodyEl) {
  tableBodyEl.innerHTML = `<tr><td colspan="6">Loading...</td></tr>`;

  try {
    const data = await apiRequest(`/complaints/student/${studentId}`, {
      method: "GET",
    });

    const complaints = Array.isArray(data) ? data : data.complaints || [];

    if (!complaints.length) {
      tableBodyEl.innerHTML = `<tr><td colspan="6" class="text-muted">No complaints found.</td></tr>`;
      return;
    }

    tableBodyEl.innerHTML = complaints
      .map((c) => {
        const statusVal = (c.status || "pending").toLowerCase();
        const statusLabel = formatStatus(statusVal);
        const dateLabel = formatDate(c.createdAt || c.date || c.created_at);

        const canDelete = statusVal === "resolved";

        const actionCell = canDelete
          ? `<button type="button"
                     class="btn btn-sm btn-outline-danger"
                     onclick="deleteStudentComplaint('${c._id}')">
               Delete
             </button>`
          : `<span class="text-muted small">-</span>`;

        return `
          <tr>
            <td>${escapeHtml(c.title || "")}</td>
            <td>${escapeHtml(c.description || "")}</td>
            <td>${escapeHtml(c.category || "")}</td>
            <td><span class="badge complaint-status-${statusVal}">${statusLabel}</span></td>
            <td>${dateLabel}</td>
            <td>${actionCell}</td>
          </tr>
        `;
      })
      .join("");
  } catch (err) {
    console.error("Error loading complaints:", err);
    tableBodyEl.innerHTML = `<tr><td colspan="6" class="text-danger">Failed to load complaints.</td></tr>`;
  }
}
async function deleteStudentComplaint(complaintId) {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this resolved complaint?"
  );
  if (!confirmDelete) return;

  try {
    await apiRequest(`/complaints/${complaintId}`, {
      method: "DELETE",
    });

    const user = getCurrentUser();
    const tableBody = document.querySelector("#complaintsTable tbody");
    if (user && tableBody) {
      await loadStudentComplaints(user._id, tableBody);
    }
  } catch (err) {
    console.error("Error deleting complaint:", err);
    alert(err.message || "Failed to delete complaint.");
  }
}

/** Format status nicely */
function formatStatus(status) {
  const val = (status || "").toLowerCase();
  if (val === "in-progress" || val === "inprogress") return "In Progress";
  if (val === "resolved") return "Resolved";
  return "Pending";
}

/** Basic date formatting */
function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit"
  });
}

/** Very simple HTML escape */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
