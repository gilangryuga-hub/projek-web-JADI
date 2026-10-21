/**
 * ============================================================================
 * KOMPONEN: AUTH MODAL (Login & Register Modal)
 * ============================================================================
 * Menyediakan modal interaktif untuk masuk (login) dan pendaftaran (register)
 * pengguna dengan gaya modern, tab switcher, toggle password, dan validasi.
 */

function initAuthModal() {
  if (document.getElementById("auth-modal")) return;

  const modal = document.createElement("div");
  modal.className = "app-modal";
  modal.id = "auth-modal";
  modal.hidden = true;
  modal.innerHTML = `
    <div class="app-modal__dialog auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <button class="app-modal__close" type="button" data-auth-close aria-label="Tutup">
        <i class="fa-solid fa-xmark"></i>
      </button>

      <div class="auth-header">
        <div class="auth-brand">Net<span class="accent">List</span></div>
        <h2 id="auth-modal-title" class="auth-title">Masuk ke Akun</h2>
        <p id="auth-modal-subtitle" class="auth-subtitle">Kelola watchlist dan catat jurnal tontonan film favoritmu.</p>
      </div>

      <div class="auth-context-notice" id="auth-context-notice" hidden>
        <i class="fa-solid fa-circle-info"></i>
        <span id="auth-context-text"></span>
      </div>

      <div class="auth-tabs" role="tablist">
        <button type="button" class="auth-tab is-active" data-auth-tab="login" role="tab" aria-selected="true">
          <i class="fa-solid fa-arrow-right-to-bracket"></i> Masuk
        </button>
        <button type="button" class="auth-tab" data-auth-tab="register" role="tab" aria-selected="false">
          <i class="fa-solid fa-user-plus"></i> Daftar
        </button>
      </div>

      <form id="auth-form" class="auth-form" novalidate>
        <div class="auth-field">
          <label for="auth-username" class="auth-label">Username</label>
          <div class="auth-input-group">
            <i class="fa-solid fa-user auth-input-icon"></i>
            <input id="auth-username" name="username" type="text" required autocomplete="username" placeholder="Masukkan username">
          </div>
        </div>

        <div class="auth-field auth-field--email" hidden>
          <label for="auth-email" class="auth-label">Email <span class="auth-optional">(opsional)</span></label>
          <div class="auth-input-group">
            <i class="fa-solid fa-envelope auth-input-icon"></i>
            <input id="auth-email" name="email" type="email" autocomplete="email" placeholder="nama@email.com">
          </div>
        </div>

        <div class="auth-field">
          <div class="auth-label-row">
            <label for="auth-password" class="auth-label">Password</label>
            <span class="auth-pwd-hint">Min. 6 karakter</span>
          </div>
          <div class="auth-input-group">
            <i class="fa-solid fa-lock auth-input-icon"></i>
            <input id="auth-password" name="password" type="password" required minlength="6" autocomplete="current-password" placeholder="Masukkan password">
            <button type="button" class="auth-pwd-toggle" aria-label="Lihat password" tabindex="-1">
              <i class="fa-regular fa-eye"></i>
            </button>
          </div>
        </div>

        <div class="app-modal__error" data-auth-error role="alert" hidden>
          <i class="fa-solid fa-circle-exclamation"></i>
          <span class="error-text"></span>
        </div>

        <button type="submit" class="btn-auth-submit" id="auth-submit-btn">
          <span class="btn-text">Masuk ke Akun</span>
        </button>
      </form>

      <div class="auth-footer">
        <span class="auth-footer-prompt" data-auth-footer-prompt>Belum punya akun?</span>
        <button type="button" class="auth-switch-link" data-auth-switch>Daftar sekarang</button>
      </div>
    </div>`;

  document.body.appendChild(modal);

  const form = modal.querySelector("#auth-form");
  const title = modal.querySelector("#auth-modal-title");
  const subtitle = modal.querySelector("#auth-modal-subtitle");
  const submitBtn = modal.querySelector("#auth-submit-btn");
  const submitText = submitBtn.querySelector(".btn-text");
  const emailField = modal.querySelector(".auth-field--email");
  const errorBox = modal.querySelector("[data-auth-error]");
  const errorText = errorBox.querySelector(".error-text");
  const contextNotice = modal.querySelector("#auth-context-notice");
  const contextText = modal.querySelector("#auth-context-text");
  const tabLogin = modal.querySelector('[data-auth-tab="login"]');
  const tabRegister = modal.querySelector('[data-auth-tab="register"]');
  const switchBtn = modal.querySelector("[data-auth-switch]");
  const footerPrompt = modal.querySelector("[data-auth-footer-prompt]");
  const pwdInput = modal.querySelector("#auth-password");
  const pwdToggle = modal.querySelector(".auth-pwd-toggle");

  let registerMode = false;

  function clearError() {
    errorText.textContent = "";
    errorBox.hidden = true;
  }

  function showError(msg) {
    errorText.textContent = msg;
    errorBox.hidden = false;
  }

  /**
   * Mengatur mode modal antara Login dan Register.
   * @param {boolean} register - True jika mode registrasi.
   */
  function setMode(register) {
    registerMode = Boolean(register);

    tabLogin.classList.toggle("is-active", !registerMode);
    tabLogin.setAttribute("aria-selected", String(!registerMode));
    tabRegister.classList.toggle("is-active", registerMode);
    tabRegister.setAttribute("aria-selected", String(registerMode));

    if (registerMode) {
      title.textContent = "Buat Akun Baru";
      subtitle.textContent = "Daftar untuk mulai menyimpan film & membuat jurnal tontonan.";
      submitText.textContent = "Daftar Akun Baru";
      emailField.hidden = false;
      footerPrompt.textContent = "Sudah punya akun?";
      switchBtn.textContent = "Masuk sekarang";
    } else {
      title.textContent = "Masuk ke Akun";
      subtitle.textContent = "Kelola watchlist dan catat jurnal tontonan film favoritmu.";
      submitText.textContent = "Masuk ke Akun";
      emailField.hidden = true;
      footerPrompt.textContent = "Belum punya akun?";
      switchBtn.textContent = "Daftar sekarang";
    }

    clearError();
  }

  /**
   * Membuka modal autentikasi.
   * @param {boolean} [register=false] - Buka dalam mode registrasi.
   * @param {string} [reason=""] - Pesan kontekstual penyebab modal dibuka.
   * @returns {void}
   */
  function open(register = false, reason = "") {
    setMode(register);

    if (reason) {
      contextText.textContent = reason;
      contextNotice.hidden = false;
    } else {
      contextNotice.hidden = true;
    }

    clearError();
    modal.hidden = false;
    document.body.style.overflow = "hidden";

    // Fokus ke field username
    setTimeout(() => {
      const usernameInput = modal.querySelector("#auth-username");
      if (usernameInput) usernameInput.focus();
    }, 50);
  }

  /**
   * Menutup modal autentikasi.
   * @returns {void}
   */
  function close() {
    modal.hidden = true;
    document.body.style.overflow = "";
    form.reset();
    clearError();
    contextNotice.hidden = true;
    if (pwdInput) pwdInput.type = "password";
    if (pwdToggle) {
      pwdToggle.innerHTML = '<i class="fa-regular fa-eye"></i>';
      pwdToggle.setAttribute("aria-label", "Lihat password");
    }
  }

  // Toggle Password Show/Hide
  if (pwdToggle && pwdInput) {
    pwdToggle.addEventListener("click", () => {
      const isPwd = pwdInput.type === "password";
      pwdInput.type = isPwd ? "text" : "password";
      pwdToggle.innerHTML = isPwd ? '<i class="fa-regular fa-eye-slash"></i>' : '<i class="fa-regular fa-eye"></i>';
      pwdToggle.setAttribute("aria-label", isPwd ? "Sembunyikan password" : "Lihat password");
    });
  }

  // Tab switcher
  tabLogin.addEventListener("click", () => setMode(false));
  tabRegister.addEventListener("click", () => setMode(true));
  switchBtn.addEventListener("click", () => setMode(!registerMode));

  // Modal backdrop click & close button
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.closest("[data-auth-close]")) {
      close();
    }
  });

  // ESC key to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) {
      close();
    }
  });

  // Form submit
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearError();

    const username = form.elements.username.value.trim();
    const password = form.elements.password.value;
    const email = form.elements.email ? form.elements.email.value.trim() : "";

    if (!username) {
      showError("Username tidak boleh kosong.");
      return;
    }
    if (!password || password.length < 6) {
      showError("Password harus memiliki minimal 6 karakter.");
      return;
    }

    submitBtn.disabled = true;
    const origText = submitText.textContent;
    submitText.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Memproses...`;

    try {
      if (registerMode) {
        await AuthService.register({ username, email, password });
        await AuthService.login({ username, password });
      } else {
        await AuthService.login({ username, password });
      }
      close();
      window.dispatchEvent(new CustomEvent("auth:changed"));
    } catch (requestError) {
      showError(requestError.message || "Gagal memproses autentikasi. Silakan periksa kembali data Anda.");
    } finally {
      submitBtn.disabled = false;
      submitText.textContent = origText;
    }
  });

  window.AuthModal = { open, close };
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAuthModal);
} else {
  initAuthModal();
}
