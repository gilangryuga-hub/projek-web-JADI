const PROFILE_DATA_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

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
  return path ? `${PROFILE_DATA_IMAGE_BASE}${path}` : "";
}

function profileStars(rating) {
  const rounded = Math.round(Number(rating) || 0);
  return `<span class="rating-stars" aria-label="Rating ${rounded} dari 5">${"★".repeat(rounded)}<span>${"★".repeat(5 - rounded)}</span></span>`;
}

function renderProfileAvatar(element, username, avatarUrl) {
  if (!element) return;

  const initials = username.slice(0, 2).toUpperCase();
  element.textContent = initials;
  element.classList.remove("has-profile-photo");
  if (!avatarUrl) return;

  const image = document.createElement("img");
  image.src = avatarUrl;
  image.alt = `Foto profil ${username}`;
  image.addEventListener("error", () => {
    image.remove();
    element.classList.remove("has-profile-photo");
    element.textContent = initials;
  }, { once: true });

  element.textContent = "";
  element.classList.add("has-profile-photo");
  element.appendChild(image);
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

  renderProfileAvatar(topAvatar, username, data.user.avatar_url);
  renderProfileAvatar(footerAvatar, username, data.user.avatar_url);
  if (footerName) footerName.textContent = username;
}

function renderProfileLogin(status) {
  status.innerHTML = `<h1>Profil membutuhkan login</h1><p>Masuk terlebih dahulu untuk melihat data profil kamu.</p><button type="button" class="profile-login-btn">Masuk / Daftar</button>`;
  status.querySelector("button").addEventListener("click", () => window.AuthModal?.open(false));
}

function ensureProfileActionMessage() {
  let message = document.getElementById("journal-action-message");
  if (message) return message;

  message = document.createElement("p");
  message.id = "journal-action-message";
  message.className = "profile-action-message";
  message.setAttribute("role", "alert");
  message.hidden = true;
  document.getElementById("profile-content").prepend(message);
  return message;
}
