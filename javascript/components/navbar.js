/**
 * ============================================================================
 * KOMPONEN: NAVBAR (Interaktivitas Mobile Toggle & Aksesibilitas)
 * ============================================================================
 */

function initNavbar() {
  const toggleBtn = document.getElementById("nav-toggle");
  const menu = document.getElementById("nav-menu") || document.querySelector(".navbar .menu");

  if (!toggleBtn || !menu) return;

  const toggleIcon = toggleBtn.querySelector("i");

  function setMenuState(open) {
    menu.classList.toggle("is-open", open);
    toggleBtn.setAttribute("aria-expanded", String(open));
    if (toggleIcon) {
      if (open) {
        toggleIcon.classList.remove("fa-bars");
        toggleIcon.classList.add("fa-xmark");
      } else {
        toggleIcon.classList.remove("fa-xmark");
        toggleIcon.classList.add("fa-bars");
      }
    }
  }

  // Klik tombol toggle (hamburger)
  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = menu.classList.contains("is-open");
    setMenuState(!isOpen);
  });

  // Tutup menu jika user mengklik di luar area navbar
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".navbar") && menu.classList.contains("is-open")) {
      setMenuState(false);
    }
  });

  // Tutup menu jika user mengklik salah satu link menu
  menu.addEventListener("click", (e) => {
    if (e.target.closest("a") && menu.classList.contains("is-open")) {
      setMenuState(false);
    }
  });

  // Tutup menu saat menekan tombol Escape (aksesibilitas keyboard)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) {
      setMenuState(false);
      toggleBtn.focus();
    }
  });

  // Reset menu jika ukuran layar diperbesar melewati breakpoint mobile (900px)
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900 && menu.classList.contains("is-open")) {
      setMenuState(false);
    }
  });
}

// Inisialisasi setelah DOM selesai dimuat
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initNavbar);
} else {
  initNavbar();
}
