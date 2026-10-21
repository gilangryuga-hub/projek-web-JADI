/**
 * ============================================================================
 * KOMPONEN: NAVBAR (Interaktivitas Mobile Toggle & Aksesibilitas)
 * ============================================================================
 */

function initNavbar() {
  const toggleBtn = document.getElementById("nav-toggle");
  const menu = document.getElementById("nav-menu") || document.querySelector(".navbar .menu");

  if (!toggleBtn || !menu) {
    initAuthNavbar();
    return;
  }

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
    e.preventDefault();
    e.stopPropagation();
    const isOpen = menu.classList.contains("is-open");
    setMenuState(!isOpen);
  });

  // Mencegah klik di dalam menu itu sendiri menutup menunya
  menu.addEventListener("click", (e) => {
    // Jika yang diklik adalah link navigasi (<a>), tutup menu
    if (e.target.closest("a")) {
      setMenuState(false);
    } else {
      e.stopPropagation();
    }
  });

  // Tutup menu jika user mengklik di luar area navbar
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".navbar") && menu.classList.contains("is-open")) {
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

  initAuthNavbar();
}

/**
 * Menambahkan kontrol login/logout dan menyinkronkan status Guest/user.
 * @returns {void}
 */
function initAuthNavbar() {
  const nav = document.querySelector(".navbar");
  if (!nav || typeof AuthService === "undefined") return;

  let authButton = nav.querySelector("[data-auth-action]");
  if (!authButton) {
    authButton = document.createElement("button");
    authButton.type = "button";
    authButton.className = "nav-auth";
    authButton.dataset.authAction = "true";
    nav.appendChild(authButton);
  }

  /**
   * Memperbarui label dan aksi tombol autentikasi.
   * @returns {void}
   */
  function renderAuthState() {
    const loggedIn = AuthService.isAuthenticated();
    authButton.textContent = loggedIn ? "Logout" : "Login";
    authButton.onclick = () => {
      if (loggedIn) {
        AuthService.logout();
      } else if (window.AuthModal) {
        window.AuthModal.open();
      }
    };
  }

  renderAuthState();
  window.addEventListener("auth:login", renderAuthState);
  window.addEventListener("auth:logout", renderAuthState);
  window.addEventListener("auth:changed", renderAuthState);
  window.addEventListener("auth:required", () => {
    if (window.AuthModal) window.AuthModal.open();
  });
}

// Inisialisasi setelah DOM selesai dimuat
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initNavbar);
} else {
  initNavbar();
}
