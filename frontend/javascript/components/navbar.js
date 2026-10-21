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
 * Menggunakan ikon modern agar tampilan navbar lebih lega dan rapi.
 * @returns {void}
 */
function initAuthNavbar() {
  const nav = document.querySelector(".navbar");
  if (!nav || typeof AuthService === "undefined") return;

  const menu = document.getElementById("nav-menu") || nav.querySelector(".menu");

  let authButton = nav.querySelector("[data-auth-action]");
  if (!authButton) {
    authButton = document.createElement("button");
    authButton.type = "button";
    authButton.className = "nav-auth";
    authButton.dataset.authAction = "true";

    const toggleBtn = nav.querySelector("#nav-toggle");
    if (toggleBtn) {
      nav.insertBefore(authButton, toggleBtn);
    } else {
      nav.appendChild(authButton);
    }
  }

  // Tangani klik ikon profil untuk Guest
  const profileLink = nav.querySelector(".profile");
  if (profileLink && !profileLink.dataset.boundAuth) {
    profileLink.dataset.boundAuth = "true";
    profileLink.addEventListener("click", (e) => {
      if (!AuthService.isAuthenticated()) {
        e.preventDefault();
        if (window.AuthModal) {
          window.AuthModal.open(false, "Silakan login untuk mengakses halaman profil kamu.");
        }
      }
    });
  }

  // Item autentikasi untuk menu dropdown mobile
  let mobileAuthItem = menu ? menu.querySelector(".mobile-menu-auth") : null;
  if (menu && !mobileAuthItem) {
    mobileAuthItem = document.createElement("a");
    mobileAuthItem.href = "#";
    mobileAuthItem.className = "mobile-menu-auth";
    menu.appendChild(mobileAuthItem);
  }

  /**
   * Memperbarui label, ikon, dan aksi tombol autentikasi.
   * @returns {void}
   */
  function renderAuthState() {
    const loggedIn = AuthService.isAuthenticated();

    // Perbarui status visual ikon profil
    if (profileLink) {
      profileLink.classList.toggle("is-logged-in", loggedIn);
      const icon = profileLink.querySelector("i");
      if (icon) {
        if (loggedIn) {
          icon.className = "fa-solid fa-circle-user";
          profileLink.setAttribute("title", "Lihat Profil Saya");
          profileLink.setAttribute("aria-label", "Lihat Profil Saya");
        } else {
          icon.className = "fa-regular fa-circle-user";
          profileLink.setAttribute("title", "Profil Pengguna");
          profileLink.setAttribute("aria-label", "Profil Pengguna");
        }
      }
    }

    // Tombol Auth Navbar (Ikon Modern)
    if (loggedIn) {
      authButton.className = "nav-auth nav-auth--logged-in";
      authButton.innerHTML = `<i class="fa-solid fa-arrow-right-from-bracket"></i>`;
      authButton.setAttribute("title", "Keluar (Logout)");
      authButton.setAttribute("aria-label", "Keluar dari akun");

      if (mobileAuthItem) {
        mobileAuthItem.innerHTML = `<i class="fa-solid fa-arrow-right-from-bracket"></i> Keluar (Logout)`;
        mobileAuthItem.onclick = (e) => {
          e.preventDefault();
          if (confirm("Apakah kamu yakin ingin keluar (logout)?")) {
            AuthService.logout();
          }
        };
      }
    } else {
      authButton.className = "nav-auth nav-auth--guest";
      authButton.innerHTML = `<i class="fa-solid fa-arrow-right-to-bracket"></i>`;
      authButton.setAttribute("title", "Masuk / Daftar Akun");
      authButton.setAttribute("aria-label", "Masuk atau Daftar Akun");

      if (mobileAuthItem) {
        mobileAuthItem.innerHTML = `<i class="fa-solid fa-arrow-right-to-bracket"></i> Masuk / Daftar`;
        mobileAuthItem.onclick = (e) => {
          e.preventDefault();
          if (window.AuthModal) {
            window.AuthModal.open(false);
          }
        };
      }
    }

    authButton.onclick = () => {
      if (loggedIn) {
        if (confirm("Apakah kamu yakin ingin keluar (logout)?")) {
          AuthService.logout();
        }
      } else if (window.AuthModal) {
        window.AuthModal.open(false);
      }
    };
  }

  renderAuthState();
  window.addEventListener("auth:login", renderAuthState);
  window.addEventListener("auth:logout", renderAuthState);
  window.addEventListener("auth:changed", renderAuthState);
  window.addEventListener("auth:required", (event) => {
    const reason = event.detail && event.detail.message ? event.detail.message : "";
    if (window.AuthModal) window.AuthModal.open(false, reason);
  });
}

// Inisialisasi setelah DOM selesai dimuat
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initNavbar);
} else {
  initNavbar();
}
