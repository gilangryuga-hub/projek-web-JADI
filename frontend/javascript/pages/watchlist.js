/**
 * Halaman watchlist yang mengambil data langsung dari Django REST API.
 */
let movies = [];
let series = [];

const container = document.getElementById("watch-content");
const searchInput = document.getElementById("search-input");

/**
 * Mengubah item API menjadi format yang dipahami card component.
 * @param {object[]} items - Item watchlist dari API.
 * @param {string} type - `movie` atau `tv`.
 * @returns {string} HTML kartu.
 */
function cardsHTML(items, type) {
  return items.map(item => createCardHTML({
    id: item.tmdb_id,
    title: item.title,
    poster_path: item.poster_path
  }, type)).join("");
}

/**
 * Merender watchlist film dan series.
 * @returns {void}
 */
function renderWatchlist() {
  if (movies.length === 0 && series.length === 0) {
    container.innerHTML = `<p class="empty">WatchList masih kosong.</p>`;
    return;
  }
  let html = "";
  if (movies.length) {
    html += `<h2 class="content-subtitle">Movies</h2>
      <div class="movie-grid" data-type="movie">${cardsHTML(movies, "movie")}</div>`;
  }
  if (series.length) {
    html += `<h2 class="content-subtitle">Series</h2>
      <div class="movie-grid" data-type="tv">${cardsHTML(series, "tv")}</div>`;
  }
  container.innerHTML = html;
}

container.addEventListener("click", async event => {
  const button = event.target.closest(".bookmark");
  const card = event.target.closest(".movie-card");
  if (!card) return;
  const type = card.dataset.type || "movie";
  const tmdbId = Number(card.dataset.id);

  if (!button) {
    location.href = getPageUrl(`detail.html?type=${type}&id=${tmdbId}`);
    return;
  }

  const item = WatchlistService.find(type, tmdbId);
  if (!item) return;
  try {
    await WatchlistService.remove(item.id);
    movies = movies.filter(entry => entry.id !== item.id);
    series = series.filter(entry => entry.id !== item.id);
    renderWatchlist();
  } catch (error) {
    console.error("Gagal menghapus watchlist:", error);
  }
});

if (searchInput) {
  searchInput.addEventListener("keydown", event => {
    if (event.key === "Enter" && searchInput.value.trim()) {
      location.href = getPageUrl(`movies.html?q=${encodeURIComponent(searchInput.value.trim())}`);
    }
  });
}

/**
 * Memuat dan merender watchlist user.
 * @returns {Promise<void>}
 */
async function initWatchlist() {
  container.innerHTML = `<p class="empty">Loading...</p>`;
  try {
    const items = await WatchlistService.getAll();
    movies = items.filter(item => item.media_type === "movie");
    series = items.filter(item => item.media_type === "tv");
    renderWatchlist();
  } catch (error) {
    console.error(error);
    container.innerHTML = `
      <div class="watchlist-empty-auth">
        <i class="fa-regular fa-bookmark empty-auth-icon"></i>
        <h2>WatchList Perlu Akses Akun</h2>
        <p>Masuk atau buat akun baru untuk mulai menyimpan dan melihat daftar tontonan kamu.</p>
        <button type="button" class="btn-primary" id="btn-watchlist-login">
          <i class="fa-solid fa-arrow-right-to-bracket"></i> Masuk / Daftar
        </button>
      </div>`;
    const btn = document.getElementById("btn-watchlist-login");
    if (btn) {
      btn.addEventListener("click", () => {
        if (window.AuthModal) {
          window.AuthModal.open(false, "Silakan login untuk melihat daftar WatchList kamu.");
        }
      });
    }
    window.dispatchEvent(new CustomEvent("auth:required", {
      detail: { message: "Silakan login terlebih dahulu untuk melihat daftar WatchList kamu." }
    }));
  }
}

initWatchlist();

window.addEventListener("auth:changed", () => {
  initWatchlist();
});
window.addEventListener("auth:login", () => {
  initWatchlist();
});
window.addEventListener("auth:logout", () => {
  movies = [];
  series = [];
  initWatchlist();
});
