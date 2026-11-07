const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");

  navToggle.setAttribute("aria-expanded", isOpen);
});


async function copyText(text) {
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
}


/* Simple copy buttons */

document.querySelectorAll(".copy-btn").forEach((btn) => {
  btn.dataset.label = btn.textContent;

  btn.addEventListener("click", async () => {
    await copyText(btn.dataset.copy);

    btn.textContent = "Copied!";
    setTimeout(() => (btn.textContent = btn.dataset.label), 1500);
  });
});


/* Copy buttons with a sub menu (e.g. curl / dnf) */

document.querySelectorAll(".copy-menu").forEach((wrap) => {
  const trigger = wrap.querySelector(".menu-trigger");
  const menu = wrap.querySelector(".menu");
  const items = [...menu.querySelectorAll(".menu-item")];

  const isOpen = () => menu.classList.contains("open");

  const setOpen = (open) => {
    menu.classList.toggle("open", open);
    trigger.setAttribute("aria-expanded", open);
  };

  const close = () => {
    const hadFocus = menu.contains(document.activeElement);
    setOpen(false);
    if (hadFocus) trigger.focus();
  };

  trigger.addEventListener("click", (e) => {
    const open = !isOpen();
    setOpen(open);

    // Enter / Space (no pointer): move focus into the menu
    if (open && e.detail === 0) items[0].focus();
  });

  items.forEach((item) => {
    const label = item.querySelector(".menu-label");
    const original = label.textContent;

    item.addEventListener("click", async () => {
      await copyText(item.dataset.copy);

      label.textContent = "Copied!";
      setTimeout(close, 700);
      setTimeout(() => (label.textContent = original), 1000);
    });
  });

  menu.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;

    e.preventDefault();
    const i = items.indexOf(document.activeElement);
    const step = e.key === "ArrowDown" ? 1 : -1;
    items[(i + step + items.length) % items.length].focus();
  });

  document.addEventListener("click", (e) => {
    if (isOpen() && !wrap.contains(e.target)) setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) close();
  });
});
