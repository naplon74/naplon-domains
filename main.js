// Copy-to-clipboard buttons
document.querySelectorAll(".copy-btn").forEach((btn) => {
  btn.dataset.label = btn.textContent;

  btn.addEventListener("click", async () => {
    const text = btn.dataset.copy;

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for http:// or file:// pages where the Clipboard API is blocked
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }

    btn.textContent = "Copied!";
    setTimeout(() => (btn.textContent = btn.dataset.label), 1500);
  });
});