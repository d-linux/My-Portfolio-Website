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
// ===== Skills slider: buttons + dots + drag/swipe
(() => {
  const slider = document.querySelector(".skills-slider");
  if (!slider) return;

  const track = slider.querySelector(".skills-track");
  const dotsWrap = slider.querySelector(".skills-dots");
  const btns = slider.querySelectorAll(".slider-btn");
  const cards = Array.from(slider.querySelectorAll(".skill-card"));

  if (!track || !dotsWrap || cards.length === 0) return;

  // Create dots
  dotsWrap.innerHTML = "";
  const dots = cards.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "dot";
    b.setAttribute("aria-label", `Go to skills card ${i + 1}`);
    b.addEventListener("click", () => scrollToCard(i));
    dotsWrap.appendChild(b);
    return b;
  });

  function cardWidthWithGap() {
    const first = cards[0];
    const cardRect = first.getBoundingClientRect();
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
    return cardRect.width + gap;
  }

  function scrollToCard(index) {
    const x = index * cardWidthWithGap();
    track.scrollTo({ left: x, behavior: "smooth" });
  }

  function activeIndex() {
    const w = cardWidthWithGap();
    return Math.round(track.scrollLeft / w);
  }

  function updateDots() {
    const idx = Math.max(0, Math.min(cards.length - 1, activeIndex()));
    dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
  }

  // Buttons
  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const dir = Number(btn.getAttribute("data-dir")) || 1;
      const next = Math.max(0, Math.min(cards.length - 1, activeIndex() + dir));
      scrollToCard(next);
    });
  });

  // Track scroll updates dots
  track.addEventListener("scroll", () => {
    window.requestAnimationFrame(updateDots);
  });

  // Drag/swipe (mouse + touch)
  let isDown = false;
  let startX = 0;
  let startLeft = 0;

  const onDown = (clientX) => {
    isDown = true;
    startX = clientX;
    startLeft = track.scrollLeft;
  };

  const onMove = (clientX) => {
    if (!isDown) return;
    const dx = clientX - startX;
    track.scrollLeft = startLeft - dx;
  };

  const onUp = () => {
    if (!isDown) return;
    isDown = false;
    // snap to nearest card
    const idx = activeIndex();
    scrollToCard(idx);
  };

  track.addEventListener("mousedown", (e) => onDown(e.clientX));
  window.addEventListener("mousemove", (e) => onMove(e.clientX));
  window.addEventListener("mouseup", onUp);

  track.addEventListener("touchstart", (e) => onDown(e.touches[0].clientX), { passive: true });
  track.addEventListener("touchmove", (e) => onMove(e.touches[0].clientX), { passive: true });
  track.addEventListener("touchend", onUp);

  // Initialize
  updateDots();
  window.addEventListener("resize", updateDots);
})();
// ===== Scroll-to-top button + keep footer links in sync with active section
(() => {
  const toTop = document.getElementById("toTop");
  if (!toTop) return;

  // show/hide button
  const onScroll = () => {
    const show = window.scrollY > 600;
    toTop.classList.toggle("is-visible", show);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // go to top
  toTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Active link styling should apply to navbar + footer links
  // (works with your existing IntersectionObserver logic by also selecting footer anchors)
  const links = [...document.querySelectorAll('a[href^="#"]')].filter(a => {
    const href = a.getAttribute("href");
    return href && href.length > 1;
  });

  const sections = [...document.querySelectorAll("section[id]")];
  const byId = new Map(links.map(a => [a.getAttribute("href")?.slice(1), a]));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const id = entry.target.id;

      // remove aria-current from all anchor links that use it
      links.forEach(a => a.removeAttribute("aria-current"));

      // set aria-current on ALL matching links (navbar + footer)
      document.querySelectorAll(`a[href="#${id}"]`).forEach(a => {
        a.setAttribute("aria-current", "page");
      });
    });
  }, { rootMargin: "-40% 0px -55% 0px", threshold: 0.01 });

  sections.forEach(s => io.observe(s));
})();
