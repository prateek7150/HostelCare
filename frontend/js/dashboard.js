document.addEventListener("DOMContentLoaded", () => {
  requireAuth(["student"]);

  const user = getCurrentUser();
  const navRoleEl = document.getElementById("nav-role");

  if (user && navRoleEl) {
    navRoleEl.textContent =
      `Role: ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`;
  }

  const complaintForm = document.getElementById("complaintForm");
  const complaintsTableBody = document.querySelector("#complaintsTable tbody");
  const feedbackForm = document.getElementById("feedbackForm");
  const feedbackMsg = document.getElementById("feedbackMsg");

  if (user && complaintsTableBody) {
    loadStudentComplaints(user._id, complaintsTableBody);
  }

  if (complaintForm) {
    complaintForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const title = document.getElementById("title").value.trim();
      const description = document.getElementById("description").value.trim();
      const category = document.getElementById("category").value;

      if (!title || !description) {
        alert("Please fill in both title and description.");
        return;
      }

      try {
        await apiRequest("/complaints", {
          method: "POST",
          body: { title, description, category }
        });

        complaintForm.reset();

        if (user && complaintsTableBody) {
          await loadStudentComplaints(user._id, complaintsTableBody);
        }

      } catch (err) {
        alert(err.message || "Could not submit complaint.");
      }
    });
  }

  if (feedbackForm) {
    feedbackForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (feedbackMsg) {
        feedbackMsg.textContent = "";
        feedbackMsg.classList.remove("text-danger", "text-success");
      }

      const roomNumber = document.getElementById("roomNumber").value.trim();
      const rating = document.getElementById("rating").value;
      const comment = document.getElementById("comment").value.trim();

      if (!roomNumber || !rating || !comment) {
        if (feedbackMsg) {
          feedbackMsg.textContent = "Please fill all feedback fields.";
          feedbackMsg.classList.add("text-danger");
        }
        return;
      }

      const studentName =
        (user && (user.name || user.fullName || user.email)) || "Student";

      try {
        await apiRequest("/feedback", {
          method: "POST",
          body: {
            studentName,
            roomNumber,
            rating: Number(rating),
            comment
          }
        });

        feedbackForm.reset();

        if (feedbackMsg) {
          feedbackMsg.textContent = "Feedback submitted successfully.";
          feedbackMsg.classList.add("text-success");
        }

      } catch (err) {
        if (feedbackMsg) {
          feedbackMsg.textContent =
            err.message || "Could not submit feedback.";
          feedbackMsg.classList.add("text-danger");
        }
      }
    });
  }
});

async function loadStudentComplaints(studentId, tableBodyEl) {
  tableBodyEl.innerHTML =
    `<tr><td colspan="6">Loading...</td></tr>`;

  try {
    const data = await apiRequest(`/complaints/student/${studentId}`);

    const complaints =
      Array.isArray(data) ? data : data.complaints || [];

    if (!complaints.length) {
      tableBodyEl.innerHTML =
        `<tr><td colspan="6" class="text-muted">No complaints found.</td></tr>`;
      return;
    }

    tableBodyEl.innerHTML = complaints.map((c) => {
      const statusVal = (c.status || "pending").toLowerCase();
      const statusLabel = formatStatus(statusVal);
      const dateLabel = formatDate(c.createdAt);

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
          <td><span class="badge complaint-status-${statusVal}">
                ${statusLabel}
              </span></td>
          <td>${dateLabel}</td>
          <td>${actionCell}</td>
        </tr>
      `;
    }).join("");

  } catch (err) {
    tableBodyEl.innerHTML =
      `<tr><td colspan="6" class="text-danger">Failed to load complaints.</td></tr>`;
  }
}

async function deleteStudentComplaint(complaintId) {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this resolved complaint?"
  );
  if (!confirmDelete) return;

  try {
    await apiRequest(`/complaints/${complaintId}`, {
      method: "DELETE"
    });

    const user = getCurrentUser();
    const tableBody = document.querySelector("#complaintsTable tbody");

    if (user && tableBody) {
      await loadStudentComplaints(user._id, tableBody);
    }

  } catch (err) {
    alert(err.message || "Failed to delete complaint.");
  }
}

function formatStatus(status) {
  if (status === "in-progress") return "In Progress";
  if (status === "resolved") return "Resolved";
  return "Pending";
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return isNaN(d.getTime())
    ? "-"
    : d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit"
      });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
