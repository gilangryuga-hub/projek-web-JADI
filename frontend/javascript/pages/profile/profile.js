const PROFILE_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

function initProfilePage() {
  const status = document.getElementById("profile-status");
  const content = document.getElementById("profile-content");
  if (!status || !content) return;

  const escapeHtml = typeof esc === "function"
    ? esc
    : value => String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[char]));

  const emptyState = message => `<p class="profile-empty">${escapeHtml(message)}</p>`;
  const posterUrl = path => path ? `${PROFILE_IMAGE_BASE}${path}` : "";
  const formatDate = value => {
    if (!value) return "-";
    return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" })
      .format(new Date(`${value}T00:00:00`));
  };
  const stars = rating => {
    const rounded = Math.round(Number(rating) || 0);
    return `<span class="rating-stars" aria-label="Rating ${rounded} dari 5">${"★".repeat(rounded)}<span>${"★".repeat(5 - rounded)}</span></span>`;
  };
  let profileJournals = [];
  let profileWatchlist = [];

  function matchesRating(item, value) {
    if (value === "all") return true;
    return Number(item.rating || 0) >= Number(value);
  }

  function renderFilms() {
    const rating = document.getElementById("films-rating-filter").value;
    const status = document.getElementById("films-status-filter").value;
    const sort = document.getElementById("films-sort").value;
    const watched = profileJournals.map(item => ({ ...item, source: "watched" }));
    const saved = profileWatchlist
      .filter(item => !profileJournals.some(journal => journal.tmdb_id === item.tmdb_id && journal.media_type === item.media_type))
      .map(item => ({ ...item, source: "watchlist", rating: null }));
    let films = [...watched, ...saved].filter(item => status === "all" || item.source === status);
    if (status !== "watchlist") films = films.filter(item => matchesRating(item, rating));
    if (sort === "name") films.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "rating") films.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    document.getElementById("films-count").textContent = `${films.length} film${films.length === 1 ? "" : "s"}`;
    document.getElementById("films-grid").innerHTML = films.length
      ? films.map(item => `<a class="film-tile" href="${getPageUrl(`detail.html?type=${item.media_type}&id=${item.tmdb_id}`)}"><div class="film-tile-poster">${item.poster_path ? `<img src="${posterUrl(item.poster_path)}" alt="Poster ${escapeHtml(item.title)}">` : `<i class="fa-solid fa-film"></i>`}<span class="film-tile-overlay">${item.source === "watchlist" ? "Watchlist" : "Watched"}</span></div><strong>${escapeHtml(item.title)}</strong><span>${item.rating ? stars(item.rating) : "Belum diberi rating"}</span></a>`).join("")
      : emptyState(status === "watchlist" ? "Watchlist masih kosong." : "Belum ada film untuk filter ini.");
  }

  function renderDiaryTable() {
    const year = document.getElementById("diary-year-filter").value;
    const rating = document.getElementById("diary-rating-filter").value;
    const entries = profileJournals.filter(item =>
      (year === "all" || String(item.watched_date).startsWith(year)) && matchesRating(item, rating)
    );
    document.getElementById("diary-count").textContent = `${entries.length} entr${entries.length === 1 ? "y" : "ies"}`;
    document.getElementById("diary-table-body").innerHTML = entries.length
      ? entries.map(item => `<div class="diary-row" role="row"><div class="diary-date"><strong>${new Date(`${item.watched_date}T00:00:00`).getDate()}</strong><span>${new Date(`${item.watched_date}T00:00:00`).toLocaleString("id-ID", { month: "short" }).toUpperCase()}</span><small>${new Date(`${item.watched_date}T00:00:00`).getFullYear()}</small></div><div class="diary-film"><strong>${escapeHtml(item.title)}</strong><span>${item.media_type === "tv" ? "Series" : "Film"}${item.notes ? " • Review tersedia" : ""}</span></div><div>${stars(item.rating)}</div><div class="diary-activity">${item.is_liked ? '<i class="fa-solid fa-heart is-liked" title="Liked"></i>' : '<i class="fa-regular fa-heart" title="Not liked"></i>'}${item.is_rewatch ? '<span class="rewatch-badge">Rewatch</span>' : ""}</div></div>`).join("")
      : emptyState("Belum ada diary untuk filter ini.");
  }

  function setupCollectionFilters() {
    ["films-rating-filter", "films-status-filter", "films-sort"].forEach(id => document.getElementById(id).addEventListener("change", renderFilms));
    ["diary-year-filter", "diary-rating-filter"].forEach(id => document.getElementById(id).addEventListener("change", renderDiaryTable));
  }

  function renderEmptyCollections() {
    document.getElementById("favorite-grid").innerHTML = emptyState("Belum ada film favorit. Tandai film sebagai disukai dari jurnal.");
    document.getElementById("activity-list").innerHTML = emptyState("Belum ada aktivitas.");
    document.getElementById("review-list").innerHTML = emptyState("Belum ada review. Tambahkan catatan saat membuat diary.");
    document.getElementById("diary-list").innerHTML = emptyState("Diary masih kosong.");
    document.getElementById("tag-list").innerHTML = emptyState("Belum ada tag.");
    document.getElementById("rating-bars").innerHTML = emptyState("Belum ada rating.");
  }

  function renderProfile(user, journals, watchlist) {
    const username = user.username || "Pengguna";
    const initials = username.slice(0, 2).toUpperCase();
    const currentYear = new Date().getFullYear();
    const liked = journals.filter(item => item.is_liked);
    profileJournals = journals;
    profileWatchlist = watchlist;
    const uniqueFilms = new Set(journals.map(item => `${item.media_type}:${item.tmdb_id}`));

    document.getElementById("profile-avatar").textContent = initials;
    document.getElementById("profile-title").textContent = username;
    document.getElementById("profile-handle").textContent = `@${username}`;
    document.querySelector(".top-bar .user-avatar").textContent = initials;
    document.querySelector(".sidebar-footer .user-avatar").textContent = initials;
    document.querySelector(".sidebar-footer .profile-name").textContent = username;
    document.getElementById("stat-films").textContent = uniqueFilms.size;
    document.getElementById("stat-year").textContent = journals.filter(item => String(item.watched_date || "").startsWith(String(currentYear))).length;

    const favorites = liked.slice(0, 4);
    document.getElementById("favorite-grid").innerHTML = favorites.length
      ? favorites.map(item => `<a class="poster-card" href="${getPageUrl(`detail.html?type=${item.media_type}&id=${item.tmdb_id}`)}"><img src="${posterUrl(item.poster_path)}" alt="Poster film ${escapeHtml(item.title)}"><span>${escapeHtml(item.title)}</span></a>`).join("")
      : emptyState("Belum ada film favorit. Tandai film sebagai disukai dari jurnal.");

    const recent = journals.slice(0, 5);
    document.getElementById("activity-list").innerHTML = recent.length
      ? recent.map(item => `<div class="activity-card"><div class="activity-icon ${item.is_liked ? "activity-icon--green" : ""}"><i class="fa-solid fa-${item.is_liked ? "heart" : "eye"}"></i></div><div><strong>${item.is_liked ? "Liked" : "Watched"} <em>${escapeHtml(item.title)}</em></strong><span>${formatDate(item.watched_date)}</span></div>${stars(item.rating)}</div>`).join("")
      : emptyState("Belum ada aktivitas.");

    const reviews = journals.filter(item => item.notes).slice(0, 5);
    document.getElementById("review-list").innerHTML = reviews.length
      ? reviews.map(item => `<article class="review-card"><div class="review-poster">${item.poster_path ? `<img src="${posterUrl(item.poster_path)}" alt="Poster ${escapeHtml(item.title)}">` : ""}</div><div class="review-body"><div class="review-meta"><span>${escapeHtml(item.title)}</span><span>${formatDate(item.watched_date)}</span></div>${stars(item.rating)}<p>${escapeHtml(item.notes)}</p><div class="review-footer"><span><i class="fa-solid fa-heart"></i> ${item.is_liked ? "Liked" : "Not liked"}</span></div></div></article>`).join("")
      : emptyState("Belum ada review. Isi catatan saat menambahkan diary.");

    document.getElementById("diary-list").innerHTML = recent.length
      ? recent.slice(0, 3).map(item => {
        const date = new Date(`${item.watched_date}T00:00:00`);
        return `<div class="diary-entry"><div class="date-badge"><strong>${String(date.getDate()).padStart(2, "0")}</strong><span>${date.toLocaleString("id-ID", { month: "short" }).toUpperCase()}</span></div><div><strong>${escapeHtml(item.title)}</strong><span>${formatDate(item.watched_date)} • ${item.rating} stars</span></div></div>`;
      }).join("")
      : emptyState("Diary masih kosong.");

    const counts = [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: journals.filter(item => Math.round(Number(item.rating)) === rating).length
    }));
    const max = Math.max(...counts.map(item => item.count), 1);
    document.getElementById("rating-bars").innerHTML = counts.map(item => `<div><span>${item.rating}</span><div><i style="width: ${(item.count / max) * 100}%"></i></div><b>${item.count}</b></div>`).join("");
    document.getElementById("tag-list").innerHTML = emptyState("Belum ada tag yang digunakan.");
    document.querySelector("#network .empty-profile-widget").textContent = "Belum ada data following.";
    const years = [...new Set(journals.map(item => String(item.watched_date || "").slice(0, 4)).filter(Boolean))];
    const yearFilter = document.getElementById("diary-year-filter");
    yearFilter.innerHTML = `<option value="all">All years</option>${years.map(year => `<option value="${year}">${year}</option>`).join("")}`;
    renderFilms();
    renderDiaryTable();
  }

  async function load() {
    if (!AuthService.isAuthenticated()) {
      status.innerHTML = `<h1>Profil membutuhkan login</h1><p>Masuk terlebih dahulu untuk melihat diary, rating, like, dan watchlist milikmu.</p><button type="button" class="profile-login-btn">Masuk / Daftar</button>`;
      status.querySelector("button").addEventListener("click", () => window.AuthModal?.open(false));
      return;
    }

    status.textContent = "Memuat data profil...";
    try {
      const [user, journals, watchlist] = await Promise.all([
        AuthService.getMe(),
        JournalService.getAll(),
        WatchlistService.getAll()
      ]);
      renderProfile(user, journals, watchlist);
      status.hidden = true;
      content.hidden = false;
    } catch (error) {
      status.textContent = error.message || "Data profil gagal dimuat.";
    }
  }

  renderEmptyCollections();
  setupCollectionFilters();
  load();
  window.addEventListener("auth:changed", load);
  window.addEventListener("auth:login", load);
  window.addEventListener("journal:changed", load);
  window.addEventListener("auth:logout", () => {
    content.hidden = true;
    status.hidden = false;
    load();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initProfilePage);
} else {
  initProfilePage();
}
