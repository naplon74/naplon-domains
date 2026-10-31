const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");

  navToggle.setAttribute("aria-expanded", isOpen);
});


document.querySelectorAll(".copy-btn").forEach((btn) => {
  btn.dataset.label = btn.textContent;

  btn.addEventListener("click", async () => {
    const text = btn.dataset.copy;

    try {
      await navigator.clipboard.writeText(text);
    } catch {
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