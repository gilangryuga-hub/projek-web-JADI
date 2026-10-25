const PROFILE_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

function profileEscapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function profilePosterUrl(path) {
  return path ? `${PROFILE_IMAGE_BASE}${path}` : "";
}

function profileStars(rating) {
  const rounded = Math.round(Number(rating) || 0);
  return `<span class="rating-stars" aria-label="Rating ${rounded} dari 5">${"★".repeat(rounded)}<span>${"★".repeat(5 - rounded)}</span></span>`;
}

async function loadProfileData() {
  if (!AuthService.isAuthenticated()) {
    throw new Error("Profil membutuhkan login");
  }

  const [user, journals, watchlist] = await Promise.all([
    AuthService.getMe(),
    JournalService.getAll(),
    WatchlistService.getAll()
  ]);

  return { user, journals, watchlist };
}

function initProfileShell(data) {
  const username = data.user.username || "Pengguna";
  const initials = username.slice(0, 2).toUpperCase();
  const topAvatar = document.querySelector(".top-bar .user-avatar");
  const footerAvatar = document.querySelector(".sidebar-footer .user-avatar");
  const footerName = document.querySelector(".sidebar-footer .profile-name");

  if (topAvatar) topAvatar.textContent = initials;
  if (footerAvatar) footerAvatar.textContent = initials;
  if (footerName) footerName.textContent = username;
}

function renderProfileLogin(status) {
  status.innerHTML = `<h1>Profil membutuhkan login</h1><p>Masuk terlebih dahulu untuk melihat data profil kamu.</p><button type="button" class="profile-login-btn">Masuk / Daftar</button>`;
  status.querySelector("button").addEventListener("click", () => window.AuthModal?.open(false));
}
