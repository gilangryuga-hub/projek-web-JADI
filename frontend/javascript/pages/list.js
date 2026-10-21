/**
 * ============================================================================
 * HALAMAN: LIST (movies.html & series.html)
 * ============================================================================
 */

// Menentukan apakah sedang membuka daftar Film atau Series dari atribut <body data-type="...">
const TYPE = document.body.dataset.type || "movie";
const IS_TV = TYPE === "tv";

const ALL_TITLE = IS_TV ? "All Series" : "All Movies";
const TITLE_SUFFIX = IS_TV ? " Series" : " Movies";

// State Halaman
let currentPage = 1;
let totalPages = 1;
let currentQuery = "";
let activeGenre = null;
let requestCounter = 0; // Mencegah race condition dari respons yang datang terlambat

// Elemen DOM
const grid = document.getElementById("movie-grid");
const contentTitle = document.getElementById("content-title");
const genreList = document.getElementById("genre-list");
const searchInput = document.getElementById("search-input");
const btnMore = document.getElementById("btn-more");

function showMessage(text) {
  if (grid) grid.innerHTML = `<p class="empty">${text}</p>`;
}

// ===== RENDER GRID =====
function showGrid(items, append = false) {
  const list = items.filter(m => m.poster_path);

  if (list.length === 0 && !append) {
    showMessage("Tidak ada data ditemukan.");
    return;
  }

  const html = list.map(m => createCardHTML(m, TYPE)).join("");

  if (append) {
    grid.insertAdjacentHTML("beforeend", html);
  } else {
    grid.innerHTML = html;
  }
}

// Inisialisasi event listener klik kartu film / series
attachCardListeners(grid);

// ===== MEMUAT DATA DARI TMDB =====
async function loadPage(page = 1) {
  const thisRequest = ++requestCounter;
  if (page === 1) showMessage("Loading...");
  btnMore.hidden = true;

  try {
    let data;
    if (currentQuery) {
      data = await getJSON(`/search/${TYPE}`, `&query=${encodeURIComponent(currentQuery)}&page=${page}`);
    } else if (activeGenre) {
      data = await getJSON(`/discover/${TYPE}`, `&with_genres=${activeGenre}&sort_by=popularity.desc&page=${page}`);
    } else {
      data = await getJSON(`/${TYPE}/popular`, `&page=${page}`);
    }

    if (thisRequest !== requestCounter) return; // Request lama diabaikan

    currentPage = data.page;
    totalPages = Math.min(data.total_pages, 500);
    showGrid(data.results, page > 1);
    btnMore.hidden = currentPage >= totalPages;
  } catch (err) {
    console.error(err);
    showMessage(`Gagal memuat data (${err.message}).`);
  }
}

function loadList() {
  currentQuery = "";
  loadPage(1);
}

// ===== FILTER GENRE =====
function clearGenreActive() {
  genreList.querySelectorAll(".genre-item").forEach(b => b.classList.remove("active"));
}

if (genreList) {
  genreList.addEventListener("click", (e) => {
    const btn = e.target.closest(".genre-item");
    if (!btn) return;

    const id = btn.dataset.genre;

    if (activeGenre === id) {
      // Klik genre yang sama -> reset ke All
      activeGenre = null;
      clearGenreActive();
      contentTitle.textContent = ALL_TITLE;
    } else {
      // Pilih genre baru
      activeGenre = id;
      clearGenreActive();
      btn.classList.add("active");
      contentTitle.textContent = btn.textContent + TITLE_SUFFIX;
    }

    if (searchInput) searchInput.value = "";
    loadList();
  });
}

// ===== PENCARIAN =====
async function doSearch(query) {
  if (query === "") {
    activeGenre = null;
    clearGenreActive();
    contentTitle.textContent = ALL_TITLE;
    loadList();
    return;
  }

  const thisRequest = ++requestCounter;
  activeGenre = null;
  clearGenreActive();
  showMessage("Loading...");

  try {
    const data = await getJSON(`/search/${TYPE}`, `&query=${encodeURIComponent(query)}`);
    if (thisRequest !== requestCounter) return;
    contentTitle.textContent = `Hasil pencarian: "${query}"`;
    showGrid(data.results);
  } catch (err) {
    console.error(err);
    showMessage(`Gagal memuat data (${err.message}).`);
  }
}

if (searchInput) {
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doSearch(searchInput.value.trim());
  });
}

btnMore.addEventListener("click", () => loadPage(currentPage + 1));

// ===== INISIALISASI HALAMAN =====
(async function initList() {
  try {
    if (AuthService.isAuthenticated()) await WatchlistService.getAll();
  } catch (error) {
    console.warn("Watchlist API belum tersedia:", error.message);
  }
  const queryFromUrl = new URLSearchParams(location.search).get("q");
  if (queryFromUrl) {
    if (searchInput) searchInput.value = queryFromUrl;
    doSearch(queryFromUrl);
  } else {
    loadList();
  }
})();
