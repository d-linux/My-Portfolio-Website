// Global foundation script
(() => {
  const root = document.documentElement;

  // Restore saved theme if added later
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    root.dataset.theme = savedTheme;
  }
})();
// ===== Navbar: mobile toggle + theme toggle + active link
(() => {
  const root = document.documentElement;

  // Theme toggle (persist)
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    root.dataset.theme = savedTheme;
  }

  const setTheme = (next) => {
    root.dataset.theme = next;
    localStorage.setItem("theme", next);
  };

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = root.dataset.theme === "light" ? "light" : "dark";
      setTheme(current === "light" ? "dark" : "light");
    });
  }

  // Mobile nav toggle
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.getElementById("nav-menu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const open = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });

    // Close after clicking a link (mobile)
    navMenu.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.matches("a")) {
        navMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Active nav link on scroll
  const sections = [...document.querySelectorAll("main section[id], section[id]")];
  const links = [...document.querySelectorAll(".nav-link")];
  const byId = new Map(links.map((a) => [a.getAttribute("href")?.replace("#", ""), a]));

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute("id");
        links.forEach((a) => a.removeAttribute("aria-current"));
        const link = byId.get(id);
        if (link) link.setAttribute("aria-current", "page");
      });
    },
    { rootMargin: "-40% 0px -55% 0px", threshold: 0.01 }
  );

  sections.forEach((s) => io.observe(s));
})();
