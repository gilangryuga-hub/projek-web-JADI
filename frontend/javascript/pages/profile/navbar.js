function initProfileNavbar() {
  const toggleBtn = document.getElementById("sidebar-toggle");
  const overlay = document.getElementById("sidebar-overlay");
  const navLinks = document.querySelectorAll("#main-nav .nav-link");

  const isMobile = () => window.innerWidth < 768;

  // 1. Muat preferensi hide navbar di komputer dari localStorage
  if (!isMobile()) {
    const isCollapsed = localStorage.getItem("profile_navbar_collapsed") === "true";
    if (isCollapsed) {
      document.body.classList.add("sidebar-desktop-collapsed");
      toggleBtn?.setAttribute("aria-expanded", "false");
    } else {
      toggleBtn?.setAttribute("aria-expanded", "true");
    }
  }

  // 2. Fungsi Toggle Sidebar (Bekerja di Mobile & Komputer)
  function toggleSidebar() {
    if (isMobile()) {
      // Toggle di Layar Mobile
      const isOpen = document.body.classList.toggle("sidebar-open");
      toggleBtn?.setAttribute("aria-expanded", String(isOpen));
    } else {
      // Toggle di Komputer / Layar Desktop
      const isCollapsed = document.body.classList.toggle("sidebar-desktop-collapsed");
      toggleBtn?.setAttribute("aria-expanded", String(!isCollapsed));

      // Simpan preferensi agar diingat saat refresh atau berpindah halaman
      localStorage.setItem("profile_navbar_collapsed", String(isCollapsed));
    }
  }

  // 3. Event Listener Klik Tombol Menu Toggle
  if (toggleBtn) {
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleSidebar();
    });
  }

  // 4. Klik Overlay (khusus Mobile) untuk menutup sidebar
  if (overlay) {
    overlay.addEventListener("click", () => {
      document.body.classList.remove("sidebar-open");
      toggleBtn?.setAttribute("aria-expanded", "false");
    });
  }

  // 5. Tutup sidebar dengan tombol Escape (Aksesibilitas Keyboard)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (document.body.classList.contains("sidebar-open")) {
        document.body.classList.remove("sidebar-open");
        toggleBtn?.setAttribute("aria-expanded", "false");
        toggleBtn?.focus();
      }
    }
  });

  // 6. Klik Menu Navigasi (#main-nav)
  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      // Ubah status kelas aktif (is-active)
      navLinks.forEach((l) => {
        l.classList.remove("is-active");
        l.removeAttribute("aria-current");
      });
      this.classList.add("is-active");
      this.setAttribute("aria-current", "page");

      // Jika di layar mobile, otomatis tutup sidebar setelah memilih menu
      if (isMobile()) {
        document.body.classList.remove("sidebar-open");
        toggleBtn?.setAttribute("aria-expanded", "false");
      }
    });
  });

  // 7. Reset kelas mobile jika ukuran layar di-resize melewati breakpoint 768px
  window.addEventListener("resize", () => {
    if (!isMobile() && document.body.classList.contains("sidebar-open")) {
      document.body.classList.remove("sidebar-open");
    }
  });
}

// Inisialisasi saat DOM sudah siap
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initProfileNavbar);
} else {
  initProfileNavbar();
}
