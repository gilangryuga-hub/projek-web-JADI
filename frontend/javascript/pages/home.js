/**
 * ============================================================================
 * HALAMAN: HOME (index.html)
 * ============================================================================
 */

// State Halaman
let heroMovies = [];        // Daftar film untuk banner (hero)
let heroIndex = 0;          // Indeks film yang aktif di hero
let currentPage = 1;         // Halaman TMDB yang sedang aktif
let totalPages = 1;          // Total halaman tersedia
let currentQuery = "";       // Kata kunci pencarian aktif
let currentHeroId = null;    // ID film yang sedang tampil di hero

// Elemen DOM
const grid = document.getElementById("movie-grid");
const sectionTitle = document.getElementById("section-title");
const searchInput = document.getElementById("search-input");
const btnMore = document.getElementById("btn-more");

const heroEl = document.getElementById("hero");
const heroTitle = document.getElementById("hero-title");
const heroRating = document.getElementById("hero-rating");
const heroDetail = document.getElementById("hero-detail");
const heroDesc = document.getElementById("hero-desc");
const btnHeroWatchlist = document.getElementById("btn-hero-watchlist");
const btnTrailer = document.getElementById("btn-trailer");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");

// ===== RENDER GRID FILM =====
function showGrid(movies, append = false) {
  const list = movies.filter(m => m.poster_path);

  if (list.length === 0 && !append) {
    grid.innerHTML = `<p class="empty">Film tidak ditemukan.</p>`;
    return;
  }

  const html = list.map(m => createCardHTML(m, "movie")).join("");

  if (append) {
    grid.insertAdjacentHTML("beforeend", html);
  } else {
    grid.innerHTML = html;
  }
}

// Inisialisasi event listener kartu film (buka detail & toggle bookmark)
attachCardListeners(grid, (toggledId) => {
  if (toggledId === currentHeroId) {
    updateHeroWatchlistButton();
  }
});

// ===== HERO BANNER =====
function updateHeroWatchlistButton() {
  if (!btnHeroWatchlist || !currentHeroId) return;
  btnHeroWatchlist.classList.toggle("active", WatchlistService.has("movie", currentHeroId));
}

async function showHero(index) {
  if (!heroMovies.length) return;

  heroIndex = (index + heroMovies.length) % heroMovies.length;
  const movie = heroMovies[heroIndex];
  currentHeroId = movie.id;

  // Tampilkan data awal yang sudah tersedia
  heroEl.style.setProperty("--hero-bg", `url(${TMDB_CONFIG.IMG_BACKDROP + movie.backdrop_path})`);
  heroTitle.textContent = movie.title;
  heroTitle.style.cursor = "pointer";
  heroTitle.onclick = () => location.href = getPageUrl(`detail.html?type=movie&id=${movie.id}`);
  heroRating.textContent = movie.vote_average ? `${movie.vote_average.toFixed(1)}/10` : "-";
  heroDesc.textContent = movie.overview || "Sinopsis belum tersedia.";
  heroDetail.textContent = "";
  updateHeroWatchlistButton();

  // Ambil data tambahan (genre & durasi) dari endpoint detail
  try {
    const detail = await getJSON(`/movie/${movie.id}`);
    if (currentHeroId !== movie.id) return; // User sudah berganti slide, abaikan

    const genres = (detail.genres || []).slice(0, 2).map(g => g.name).join(" | ");
    const year = (movie.release_date || "").slice(0, 4);
    const runtime = formatRuntime(detail.runtime);

    heroDetail.textContent = [genres, year, runtime].filter(Boolean).map(t => "| " + t).join(" ");
  } catch (err) {
    console.error("Gagal memuat detail hero:", err);
  }
}

// Tombol Watchlist di Hero
btnHeroWatchlist.addEventListener("click", () => {
  if (!currentHeroId) return;

  const isAdded = WatchlistService.toggle("movie", currentHeroId);
  updateHeroWatchlistButton();

  // Samakan tampilan bookmark pada kartu di dalam grid jika film itu ada
  const cardBookmark = grid.querySelector(`[data-id="${currentHeroId}"] .bookmark`);
  if (cardBookmark) {
    cardBookmark.classList.toggle("active", isAdded);
  }
});

// Tombol Navigasi Hero Slider
btnPrev.addEventListener("click", () => showHero(heroIndex - 1));
btnNext.addEventListener("click", () => showHero(heroIndex + 1));

// Tombol Trailer di Hero
btnTrailer.addEventListener("click", async () => {
  if (!currentHeroId) return;

  try {
    const data = await getJSON(`/movie/${currentHeroId}/videos`);
    const trailer = (data.results || []).find(v => v.site === "YouTube" && v.type === "Trailer");
    if (trailer) {
      window.open(`https://www.youtube.com/watch?v=${trailer.key}`, "_blank");
    } else {
      alert("Trailer tidak tersedia.");
    }
  } catch (err) {
    console.error(err);
    alert("Gagal memuat trailer.");
  }
});

// ===== PENCARIAN & PAGINASI =====
searchInput.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;

  const query = searchInput.value.trim();
  if (query === "") {
    loadPopular();
    return;
  }

  currentQuery = query;
  sectionTitle.textContent = `Hasil pencarian: "${query}"`;
  loadPage(1);
});

btnMore.addEventListener("click", () => loadPage(currentPage + 1));

// ===== MEMUAT DATA FILM =====
async function loadPage(page = 1) {
  btnMore.hidden = true;

  try {
    let data;
    if (currentQuery) {
      data = await getJSON("/search/movie", `&query=${encodeURIComponent(currentQuery)}&page=${page}`);
    } else {
      data = await getJSON("/movie/popular", `&page=${page}`);
    }

    currentPage = data.page;
    totalPages = Math.min(data.total_pages, 500);
    showGrid(data.results, page > 1);
    btnMore.hidden = currentPage >= totalPages;

    // Isi banner hero hanya saat memuat daftar populer awal
    if (page === 1 && !currentQuery) {
      heroMovies = (data.results || []).filter(m => m.backdrop_path).slice(0, 5);
      if (heroMovies.length) showHero(0);
    }
  } catch (err) {
    console.error(err);
    if (page === 1) {
      heroTitle.textContent = "Gagal memuat data";
      heroDesc.textContent = "Periksa koneksi internet kamu atau konfigurasi API key.";
      grid.innerHTML = `<p class="empty">${err.message}</p>`;
    }
  }
}

function loadPopular() {
  currentQuery = "";
  sectionTitle.textContent = "Popular Movies";
  loadPage(1);
}

// Jalankan saat halaman dibuka
loadPopular();
