document.addEventListener("DOMContentLoaded", async () => {
  const placeholder = document.getElementById("footer-placeholder");
  if (!placeholder) return;

  try {
    const res = await fetch("/components/footer.html");
    const html = await res.text();
    placeholder.innerHTML = html;

    const year = document.getElementById("footerYear");
    if (year) year.textContent = new Date().getFullYear();
  } catch (err) {
    console.error("Failed to load footer", err);
  }
});
