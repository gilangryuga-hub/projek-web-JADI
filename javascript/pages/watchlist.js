/**
 * ============================================================================
 * HALAMAN: WATCHLIST (watchlist.html)
 * ============================================================================
 */

let movies = []; // Data detail film di watchlist
let series = []; // Data detail series di watchlist

const container = document.getElementById("watch-content");
const searchInput = document.getElementById("search-input");

// Mengambil detail untuk banyak ID secara paralel
async function fetchDetails(type, ids) {
  const results = await Promise.all(
    ids.map(id => getJSON(`/${type}/${id}`).catch(() => null))
  );
  return results.filter(Boolean);
}

// ===== RENDER WATCHLIST =====
function cardsHTML(items, type) {
  return items
    .filter(m => m.poster_path)
    .map(m => createCardHTML(m, type))
    .join("");
}

function render() {
  if (movies.length === 0 && series.length === 0) {
    container.innerHTML = `<p class="empty">WatchList masih kosong.<br>Klik ikon bookmark pada film atau series untuk menyimpannya di sini.</p>`;
    return;
  }

  let html = "";

  if (movies.length) {
    html += `
      <h2 class="content-subtitle">Movies</h2>
      <div class="movie-grid" data-type="movie">${cardsHTML(movies, "movie")}</div>
    `;
  }

  if (series.length) {
    html += `
      <h2 class="content-subtitle">Series</h2>
      <div class="movie-grid" data-type="tv">${cardsHTML(series, "tv")}</div>
    `;
  }

  container.innerHTML = html;
}

// Event Delegation untuk klik di dalam container Watchlist
container.addEventListener("click", (e) => {
  const btn = e.target.closest(".bookmark");

  // Jika klik kartu, pergi ke halaman detail
  if (!btn) {
    const card = e.target.closest(".movie-card");
    if (card) {
      const type = card.dataset.type || card.closest(".movie-grid")?.dataset.type || "movie";
      location.href = `detail.html?type=${type}&id=${card.dataset.id}`;
    }
    return;
  }

  // Jika klik bookmark (menghapus dari watchlist)
  const card = btn.closest(".movie-card");
  const id = Number(card.dataset.id);
  const type = card.dataset.type || card.closest(".movie-grid")?.dataset.type || "movie";

  WatchlistService.toggle(type, id);

  if (type === "tv") {
    series = series.filter(s => s.id !== id);
  } else {
    movies = movies.filter(m => m.id !== id);
  }

  render();
});

// Pencarian dari Watchlist diteruskan ke halaman Movies
if (searchInput) {
  searchInput.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const q = searchInput.value.trim();
    if (q) location.href = "movies.html?q=" + encodeURIComponent(q);
  });
}

// ===== INISIALISASI =====
async function init() {
  const movieIds = WatchlistService.getAll("movie");
  const seriesIds = WatchlistService.getAll("tv");

  if (movieIds.length === 0 && seriesIds.length === 0) {
    render();
    return;
  }

  container.innerHTML = `<p class="empty">Loading...</p>`;

  try {
    [movies, series] = await Promise.all([
      fetchDetails("movie", movieIds),
      fetchDetails("tv", seriesIds)
    ]);
    render();
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p class="empty">Gagal memuat data (${err.message}).</p>`;
  }
}

init();
