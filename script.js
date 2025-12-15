// Global foundation script
(() => {
  const root = document.documentElement;

  // Restore saved theme if added later
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    root.dataset.theme = savedTheme;
  }
})();
