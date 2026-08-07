const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
);

document.querySelectorAll(".reveal, .reveal-stagger").forEach((el) => observer.observe(el));

const burger = document.querySelector(".nav__burger");
const navLinks = document.querySelector(".nav__links");
if (burger && navLinks) {
  burger.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    burger.textContent = open ? "✕" : "☰";
    burger.setAttribute("aria-expanded", String(open));
  });
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      burger.textContent = "☰";
      burger.setAttribute("aria-expanded", "false");
    })
  );
}

document.querySelectorAll(".ba-slider__frame").forEach((frame) => {
  let dragging = false;

  const setPos = (clientX) => {
    const rect = frame.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    frame.style.setProperty("--pos", pct + "%");
  };

  frame.addEventListener("pointerdown", (e) => {
    dragging = true;
    setPos(e.clientX);
    try {
      frame.setPointerCapture(e.pointerId);
    } catch (err) {
      // No-op: capture can fail for synthetic/non-standard pointer sessions,
      // dragging still works via the window-level pointerup/move fallback below.
    }
  });
  window.addEventListener("pointermove", (e) => {
    if (dragging) setPos(e.clientX);
  });
  window.addEventListener("pointerup", () => { dragging = false; });
  window.addEventListener("pointercancel", () => { dragging = false; });
});
