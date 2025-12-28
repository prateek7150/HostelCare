// ===============================
// Pagination State
// ===============================
let currentPage = 1;
const PAGE_LIMIT = 10;

// ===============================
// On Page Load
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  requireAuth(["warden"]);

  const user = getCurrentUser();
  const navRoleEl = document.getElementById("nav-role");
  const statusFilter = document.getElementById("statusFilter");
  const tableBody = document.querySelector("#wardenComplaintsTable tbody");
  const tableMsg = document.getElementById("wardenTableMsg");

  if (user && navRoleEl) {
    navRoleEl.textContent =
      `Role: ${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}`;
  }

  // Initial load
  loadAllComplaints(tableBody, tableMsg, "", currentPage);

  // Filter change → reset page
  if (statusFilter) {
    statusFilter.addEventListener("change", () => {
      currentPage = 1;
      loadAllComplaints(tableBody, tableMsg, statusFilter.value, currentPage);
    });
  }
});

// ===============================
// Load Complaints (Paginated)
// ===============================
async function loadAllComplaints(
  tableBodyEl,
  msgEl,
  statusFilter = "",
  page = 1
) {
  if (!tableBodyEl) return;

  tableBodyEl.innerHTML = `<tr><td colspan="6">Loading...</td></tr>`;
  if (msgEl) msgEl.textContent = "";

  try {
    let url = `/complaints?page=${page}&limit=${PAGE_LIMIT}`;
    if (statusFilter) url += `&status=${statusFilter}`;

    const data = await apiRequest(url, { method: "GET" });
    const complaints = data.complaints || [];
    const pagination = data.pagination;

    if (!complaints.length) {
      tableBodyEl.innerHTML = `
        <tr>
          <td colspan="6" class="text-muted text-center">
            No complaints found.
          </td>
        </tr>`;
      renderPagination(null);
      return;
    }

    tableBodyEl.innerHTML = complaints.map(renderWardenRow).join("");
    renderPagination(pagination, statusFilter);
  } catch (err) {
    console.error(err);
    tableBodyEl.innerHTML = `
      <tr>
        <td colspan="6" class="text-danger text-center">
          Failed to load complaints.
        </td>
      </tr>`;
    if (msgEl) msgEl.textContent = err.message;
  }
}

// ===============================
// Render Single Row (WITH DESCRIPTION)
// ===============================
function renderWardenRow(c) {
  const status = (c.status || "pending").toLowerCase();
  const isResolved = status === "resolved";

  return `
    <tr data-id="${c._id}">
      <td data-label="Student">
        ${escapeHtml(c.studentName || "Student")}
        <br>
        <small class="text-muted">
          Room ${escapeHtml(c.roomNumber || "N/A")}
        </small>
      </td>

     <td data-label="Complaint">
  <strong>${escapeHtml(c.title || "")}</strong>

  <div class="text-muted small mt-1 description-clamp">
    ${escapeHtml(c.description || "No description provided")}
  </div>

  ${
    c.description && c.description.length > 120
      ? `<button
          type="button"
          class="btn btn-link p-0 small mt-1 toggle-desc"
          onclick="toggleDescription(this)">
          View more
        </button>`
      : ""
  }
</td>


      <td data-label="Category">
        ${escapeHtml(c.category || "-")}
      </td>

      <td data-label="Status">
        <span class="badge complaint-status-${status}">
          ${formatStatus(status)}
        </span>
      </td>

      <td data-label="Change Status">
        <div class="d-flex flex-column gap-1">
          <select class="form-select form-select-sm status-select"
            ${isResolved ? "disabled" : ""}>
            <option value="pending" ${status === "pending" ? "selected" : ""}>
              Pending
            </option>
            <option value="in-progress"
              ${(status === "in-progress" || status === "inprogress") ? "selected" : ""}>
              In Progress
            </option>
            <option value="resolved" ${isResolved ? "selected" : ""}>
              Resolved
            </option>
          </select>

          <button type="button"
            class="btn btn-sm ${
              isResolved ? "btn-outline-secondary" : "btn-outline-primary"
            }"
            ${isResolved ? "disabled" : ""}
            onclick="updateComplaintStatus('${c._id}', this)">
            ${isResolved ? "Locked" : "Update"}
          </button>
        </div>
      </td>

      <td data-label="Date">
        ${formatDate(c.createdAt)}
      </td>
    </tr>
  `;
}

// ===============================
// Update Complaint Status
// ===============================
async function updateComplaintStatus(complaintId, buttonEl) {
  const row = buttonEl.closest("tr");
  if (!row) return;

  const select = row.querySelector(".status-select");
  const badge = row.querySelector(".badge");

  buttonEl.disabled = true;
  buttonEl.textContent = "Saving...";

  try {
    await apiRequest(`/complaints/${complaintId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: select.value }),
    });

    badge.textContent = formatStatus(select.value);
    badge.className = "badge";
    badge.classList.add(`complaint-status-${select.value}`);

    if (select.value === "resolved") {
      select.disabled = true;
      buttonEl.textContent = "Locked";
      buttonEl.classList.remove("btn-outline-primary");
      buttonEl.classList.add("btn-outline-secondary");
    } else {
      buttonEl.disabled = false;
      buttonEl.textContent = "Update";
    }
  } catch (err) {
    console.error(err);
    alert(err.message || "Failed to update status.");
    buttonEl.disabled = false;
    buttonEl.textContent = "Update";
  }
}

// ===============================
// Pagination
// ===============================
function renderPagination(pagination, statusFilter = "") {
  const container = document.getElementById("paginationControls");
  if (!container) return;

  if (!pagination || pagination.totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center gap-3 mt-3">
      <button class="btn btn-sm btn-outline-secondary"
        ${pagination.page === 1 ? "disabled" : ""}
        onclick="changePage(${pagination.page - 1}, '${statusFilter}')">
        Previous
      </button>

      <span class="small text-muted">
        Page ${pagination.page} of ${pagination.totalPages}
      </span>

      <button class="btn btn-sm btn-outline-secondary"
        ${pagination.page === pagination.totalPages ? "disabled" : ""}
        onclick="changePage(${pagination.page + 1}, '${statusFilter}')">
        Next
      </button>
    </div>
  `;
}

function changePage(page, statusFilter = "") {
  currentPage = page;
  loadAllComplaints(
    document.querySelector("#wardenComplaintsTable tbody"),
    document.getElementById("wardenTableMsg"),
    statusFilter,
    currentPage
  );
}

// ===============================
// Helpers
// ===============================
function formatStatus(status) {
  const val = (status || "").toLowerCase();
  if (val === "in-progress" || val === "inprogress") return "In Progress";
  if (val === "resolved") return "Resolved";
  return "Pending";
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function toggleDescription(btn) {
  const desc = btn.previousElementSibling;
  if (!desc) return;

  const expanded = desc.classList.toggle("expanded");
  btn.textContent = expanded ? "Hide" : "View more";
}

