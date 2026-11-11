// After deploying the backend, replace the URL below with your Render service URL.
const API_BASE_URL = "https://YOUR-RENDER-SERVICE.onrender.com/api";
const reportsList = document.getElementById("reportsList");
const form = document.getElementById("reportForm");
const formMessage = document.getElementById("formMessage");

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[ch]));
}

function renderReports(reports) {
  if (!reports.length) {
    reportsList.innerHTML = '<p class="empty">No reports yet. Be the first to share a verified observation.</p>';
    return;
  }
  reportsList.innerHTML = reports.map(report => {
    const severity = String(report.severity || "Low").toLowerCase();
    const date = report.createdAt ? new Date(report.createdAt).toLocaleString() : "Recently submitted";
    return `<article class="report-card">
      <div class="report-top"><h3>${escapeHTML(report.type)} · ${escapeHTML(report.location)}</h3>
      <span class="tag ${escapeHTML(severity)}">${escapeHTML(report.severity)}</span></div>
      <p>${escapeHTML(report.description)}</p>
      <div class="report-meta">Reported by ${escapeHTML(report.name || "Community member")} · ${escapeHTML(date)}</div>
    </article>`;
  }).join("");
}

async function loadReports() {
  reportsList.innerHTML = '<p class="empty">Loading reports...</p>';
  try {
    const response = await fetch(`${API_BASE_URL}/reports`);
    if (!response.ok) throw new Error("Could not load reports");
    const data = await response.json();
    renderReports(data);
  } catch (error) {
    reportsList.innerHTML = '<p class="empty">Reports could not load yet. Deploy the backend and update API_BASE_URL in script.js.</p>';
  }
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  formMessage.textContent = "";
  formMessage.className = "message";
  const submitButton = form.querySelector("button[type=submit]");
  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";
  const payload = Object.fromEntries(new FormData(form).entries());
  try {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Submission failed");
    form.reset();
    formMessage.textContent = "Report submitted successfully.";
    await loadReports();
  } catch (error) {
    formMessage.textContent = error.message.includes("Failed to fetch")
      ? "Backend is not connected yet. Complete deployment setup first."
      : error.message;
    formMessage.classList.add("error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Submit report";
  }
});

document.getElementById("refreshButton").addEventListener("click", loadReports);
loadReports();
