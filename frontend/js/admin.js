let adminCurrentPage = 1;
const ADMIN_PAGE_LIMIT = 10;

document.addEventListener("DOMContentLoaded", () => {
  requireAuth(["admin"]);

  const user = getCurrentUser();
  const navRoleEl = document.getElementById("nav-role");
  const statusFilter = document.getElementById("adminStatusFilter");
  const tableBody = document.querySelector("#adminComplaintsTable tbody");
  const tableMsg = document.getElementById("adminTableMsg");
  const summaryEl = document.getElementById("adminSummary");

  if (user && navRoleEl) {
    navRoleEl.textContent = `Role: ${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}`;
  }

  loadAdminComplaints(tableBody, tableMsg, summaryEl, "", adminCurrentPage);
  loadMessFeedback();

  if (statusFilter) {
    statusFilter.addEventListener("change", () => {
      adminCurrentPage = 1;
      loadAdminComplaints(
        tableBody,
        tableMsg,
        summaryEl,
        statusFilter.value,
        adminCurrentPage
      );
    });
  }
});

async function loadAdminComplaints(
  tableBodyEl,
  msgEl,
  summaryEl,
  statusFilter = "",
  page = 1
) {
  if (!tableBodyEl) return;

  tableBodyEl.innerHTML = `<tr><td colspan="5">Loading...</td></tr>`;
  if (msgEl) msgEl.textContent = "";
  if (summaryEl) summaryEl.textContent = "";

  try {
    let url = `/complaints?page=${page}&limit=${ADMIN_PAGE_LIMIT}`;
    if (statusFilter) url += `&status=${statusFilter}`;

    const data = await apiRequest(url, { method: "GET" });
    const complaints = data.complaints || [];
    const pagination = data.pagination;

    if (!complaints.length) {
      tableBodyEl.innerHTML = `
        <tr>
          <td colspan="5" class="text-muted text-center">
            No complaints found.
          </td>
        </tr>
      `;
      renderAdminPagination(null);
      return;
    }

    if (summaryEl) {
      const total = pagination?.total || complaints.length;
      const pending = complaints.filter(c => (c.status || "").toLowerCase() === "pending").length;
      const inProgress = complaints.filter(c => {
        const s = (c.status || "").toLowerCase();
        return s === "in-progress" || s === "inprogress";
      }).length;
      const resolved = complaints.filter(c => (c.status || "").toLowerCase() === "resolved").length;

      summaryEl.textContent = `Total: ${total} | Pending: ${pending} | In Progress: ${inProgress} | Resolved: ${resolved}`;
    }

    tableBodyEl.innerHTML = complaints.map(c => {
      const statusVal = (c.status || "pending").toLowerCase();
      return `
        <tr>
          <td>
            ${escapeHtml(c.studentName || "Student")}
            <br>
            <small class="text-muted">Room ${escapeHtml(c.roomNumber || "N/A")}</small>
          </td>
          <td>${escapeHtml(c.title || "")}</td>
          <td>${escapeHtml(c.category || "")}</td>
          <td>
            <span class="badge complaint-status-${statusVal}">
              ${formatStatus(statusVal)}
            </span>
          </td>
          <td>${formatDate(c.createdAt)}</td>
        </tr>
      `;
    }).join("");

    renderAdminPagination(pagination, statusFilter);

  } catch (err) {
    tableBodyEl.innerHTML = `
      <tr>
        <td colspan="5" class="text-danger text-center">
          Failed to load complaints.
        </td>
      </tr>
    `;
    if (msgEl) msgEl.textContent = err.message || "Error loading complaints";
  }
}

function renderAdminPagination(pagination, statusFilter = "") {
  const container = document.getElementById("adminPagination");
  if (!container) return;

  if (!pagination || pagination.totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center gap-3 mt-3">
      <button class="btn btn-sm btn-outline-secondary"
        ${pagination.page === 1 ? "disabled" : ""}
        onclick="changeAdminPage(${pagination.page - 1}, '${statusFilter}')">
        Previous
      </button>

      <span class="small text-muted">
        Page ${pagination.page} of ${pagination.totalPages}
      </span>

      <button class="btn btn-sm btn-outline-secondary"
        ${pagination.page === pagination.totalPages ? "disabled" : ""}
        onclick="changeAdminPage(${pagination.page + 1}, '${statusFilter}')">
        Next
      </button>
    </div>
  `;
}

function changeAdminPage(page, statusFilter = "") {
  adminCurrentPage = page;
  loadAdminComplaints(
    document.querySelector("#adminComplaintsTable tbody"),
    document.getElementById("adminTableMsg"),
    document.getElementById("adminSummary"),
    statusFilter,
    adminCurrentPage
  );
}

async function loadMessFeedback() {
  const table = document.getElementById("adminFeedbackTable");
  if (!table) return;

  const tbody = table.querySelector("tbody");
  const msgEl = document.getElementById("adminFeedbackMsg");

  tbody.innerHTML = `
    <tr>
      <td colspan="4" class="text-muted text-center">
        Loading feedback...
      </td>
    </tr>
  `;

  try {
    const data = await apiRequest("/feedback", { method: "GET" });
    const feedback = data.feedback || [];

    if (!feedback.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-muted text-center">
            No mess feedback found.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = feedback.map(f => `
      <tr>
        <td>${escapeHtml(f.studentName || "Student")}</td>
        <td>⭐ ${f.rating}</td>
        <td>${escapeHtml(f.comment || "")}</td>
        <td>${formatDate(f.createdAt)}</td>
      </tr>
    `).join("");

  } catch (err) {
    if (msgEl) {
      msgEl.textContent = err.message || "Failed to load feedback";
      msgEl.classList.add("text-danger");
    }
  }
}

function formatStatus(status) {
  if (status === "in-progress" || status === "inprogress") return "In Progress";
  if (status === "resolved") return "Resolved";
  return "Pending";
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-IN", {
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
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("createWardenForm");
  if (!form) return;

  const msg = document.getElementById("wardenMsg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const name = document.getElementById("wardenName").value.trim();
    const email = document.getElementById("wardenEmail").value.trim();
    const password = document.getElementById("wardenPassword").value;

    try {
      await apiRequest("/admin/create-warden", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      msg.textContent = "Warden created successfully";
      msg.className = "text-success small";

      form.reset();
    } catch (err) {
      msg.textContent = err.message || "Failed to create warden";
      msg.className = "text-danger small";
    }
  });
});
