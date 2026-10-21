/**
 * Handler modal login/register dan status user.
 */
function initAuthModal() {
  const modal = document.createElement("div");
  modal.className = "app-modal";
  modal.id = "auth-modal";
  modal.hidden = true;
  modal.innerHTML = `
    <div class="app-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <button class="app-modal__close" type="button" data-auth-close aria-label="Tutup">&times;</button>
      <h2 id="auth-modal-title">Login</h2>
      <form id="auth-form">
        <label>Username<input name="username" required autocomplete="username"></label>
        <label class="auth-email" hidden>Email<input name="email" type="email" autocomplete="email"></label>
        <label>Password<input name="password" type="password" required minlength="6" autocomplete="current-password"></label>
        <p class="app-modal__error" data-auth-error role="alert"></p>
        <button type="submit" class="btn-primary">Login</button>
      </form>
      <button type="button" class="app-modal__switch" data-auth-switch>Belum punya akun? Daftar</button>
    </div>`;
  document.body.appendChild(modal);

  const form = modal.querySelector("#auth-form");
  const title = modal.querySelector("#auth-modal-title");
  const submit = form.querySelector("button");
  const email = modal.querySelector(".auth-email");
  const error = modal.querySelector("[data-auth-error]");
  let registerMode = false;

  /**
   * Membuka modal autentikasi.
   * @param {boolean} [register=false] - Buka dalam mode registrasi.
   * @returns {void}
   */
  function open(register = false) {
    registerMode = register;
    title.textContent = register ? "Daftar" : "Login";
    submit.textContent = register ? "Daftar" : "Login";
    email.hidden = !register;
    modal.querySelector("[data-auth-switch]").textContent = register
      ? "Sudah punya akun? Login"
      : "Belum punya akun? Daftar";
    error.textContent = "";
    modal.hidden = false;
    form.elements.username.focus();
  }

  /**
   * Menutup modal autentikasi.
   * @returns {void}
   */
  function close() {
    modal.hidden = true;
    form.reset();
  }

  modal.addEventListener("click", event => {
    if (event.target === modal || event.target.closest("[data-auth-close]")) close();
    if (event.target.closest("[data-auth-switch]")) open(!registerMode);
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    error.textContent = "";
    const data = Object.fromEntries(new FormData(form));
    try {
      if (registerMode) {
        await AuthService.register(data);
        await AuthService.login({ username: data.username, password: data.password });
      } else {
        await AuthService.login(data);
      }
      close();
      window.dispatchEvent(new CustomEvent("auth:changed"));
    } catch (requestError) {
      error.textContent = requestError.message;
    }
  });

  window.AuthModal = { open, close };
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAuthModal);
} else {
  initAuthModal();
}
