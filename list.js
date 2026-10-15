
// 1. PENGATURAN
console.log("list.js jalan");
const API_KEY = "5675db644132bff8db5ff739e4cb76c8";                      // ganti dengan API key TMDB milikmu
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_POSTER = "https://image.tmdb.org/t/p/w500"; // alamat dasar gambar poster
let currentPage = 1;      // halaman TMDB yang sedang dimuat
let totalPages = 1;       // jumlah halaman yang tersedia
let currentQuery = "";    // kata pencarian aktif ("" = bukan pencarian)
const btnMore = document.getElementById("btn-more");


// Baca jenis halaman dari <body data-type="...">
const TYPE = document.body.dataset.type;             // "movie" atau "tv"
const IS_TV = TYPE === "tv";

// Teks & kunci penyimpanan yang berbeda untuk film dan series
const ALL_TITLE = IS_TV ? "All Series" : "All Movies";
const TITLE_SUFFIX = IS_TV ? " Series" : " Movies";
const WATCH_KEY = IS_TV ? "watchlist_tv" : "watchlist";   // film tetap memakai "watchlist" (sama dengan halaman index)

let activeGenre = null;     // id genre yang sedang dipilih (null = semua)
let requestCounter = 0;     // penanda permintaan terbaru (mencegah hasil lama menimpa yang baru)

// Watchlist disimpan di browser
let watchlist = [];
try {
  watchlist = JSON.parse(localStorage.getItem(WATCH_KEY)) || [];
} catch (e) {
  watchlist = [];
}

// 2. ELEMEN HTML
const grid = document.getElementById("movie-grid");
const contentTitle = document.getElementById("content-title");
const genreList = document.getElementById("genre-list");
const searchInput = document.getElementById("search-input");


// 3. FUNGSI BANTU

// Ambil data JSON dari TMDB
async function getJSON(path, extraParams = "") {
  const url = `${BASE_URL}${path}?api_key=${API_KEY}&language=en-US${extraParams}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("kode " + res.status);
  return res.json();
}

// Cegah karakter berbahaya masuk ke HTML
function esc(text) {
  return String(text).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function saveWatchlist() {
  try {
    localStorage.setItem(WATCH_KEY, JSON.stringify(watchlist));
  } catch (e) { /* abaikan jika penyimpanan diblokir */ }
}

function isInWatchlist(id) {
  return watchlist.includes(id);
}

// Tampilkan pesan di area film
function showMessage(text) {
  grid.innerHTML = `<p class="empty">${text}</p>`;
}


// 4. TAMPILKAN FILM DI GRID
function showGrid(items, append = false) {
  const list = items.filter(m => m.poster_path);   // tanpa batas 18 lagi

  if (list.length === 0 && !append) {
    showMessage("Tidak ditemukan.");
    return;
  }

 const html = list.map(m => {
    const judul = m.title || m.name;
    return `
      <div class="movie-card" data-id="${m.id}">
        <img src="${IMG_POSTER + m.poster_path}" alt="${esc(judul)}">
        <span class="rating"><i class="fa-solid fa-star"></i> ${m.vote_average.toFixed(1)}/10</span>
        <button class="bookmark ${isInWatchlist(m.id) ? "active" : ""}" aria-label="Watchlist">
          <i class="fa-solid fa-bookmark"></i>
        </button>
      </div>`;
  }).join("");

  if (append) grid.insertAdjacentHTML("beforeend", html);
  else grid.innerHTML = html;
}

// Klik bookmark (event delegation: satu listener untuk semua kartu)
grid.addEventListener("click", (e) => {
  const btn = e.target.closest(".bookmark");

  if (!btn) {
    const card = e.target.closest(".movie-card");
    if (card) location.href = `detail.html?type=${TYPE}&id=${card.dataset.id}`;
    return;
  }
  
  const id = Number(btn.closest(".movie-card").dataset.id);
  if (isInWatchlist(id)) {
    watchlist = watchlist.filter(x => x !== id);   // hapus dari watchlist
  } else {
    watchlist.push(id);                            // tambah ke watchlist
  }
  saveWatchlist();
  btn.classList.toggle("active", isInWatchlist(id));
});


// 5. MEMUAT DAFTAR (SEMUA / PER GENRE)
async function loadPage(page = 1) {
  if (API_KEY === "API_KEY_KAMU") {
    showMessage("API key belum diisi. Ganti API_KEY_KAMU di bagian atas list.js.");
    return;
  }

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

    if (thisRequest !== requestCounter) return;

    currentPage = data.page;
    totalPages = Math.min(data.total_pages, 500);   // TMDB membatasi maksimal 500 halaman
    showGrid(data.results, page > 1);
    btnMore.hidden = currentPage >= totalPages;     // sembunyikan jika sudah halaman terakhir
  } catch (err) {
    console.error(err);
    showMessage(`Gagal memuat data (${err.message}).`);
  }
}

function loadList() {
  currentQuery = "";
  loadPage(1);
}

function doSearch(query) {
  currentQuery = query;
  activeGenre = null;
  clearGenreActive();
  contentTitle.textContent = query ? `Hasil pencarian: "${query}"` : ALL_TITLE;
  loadPage(1);
}


// 6. SIDEBAR GENRE
function clearGenreActive() {
  genreList.querySelectorAll(".genre-item").forEach(b => b.classList.remove("active"));
}

genreList.addEventListener("click", (e) => {
  const btn = e.target.closest(".genre-item");
  if (!btn) return;

  const id = btn.dataset.genre;

  if (activeGenre === id) {
    // Klik genre yang sama lagi -> kembali ke "All"
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

  searchInput.value = "";
  loadList();
});


// 7. SEARCH
async function doSearch(query) {
  // Kolom kosong -> kembali ke daftar semua
  if (query === "") {
    activeGenre = null;
    clearGenreActive();
    contentTitle.textContent = ALL_TITLE;
    loadList();
    return;
  }

  if (API_KEY === "API_KEY_KAMU") {
    showMessage("API key belum diisi. Ganti API_KEY_KAMU di bagian atas list.js.");
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

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") doSearch(searchInput.value.trim());
});


// 8. MULAI
// Jika datang dari kotak search di halaman lain (?q=kata), langsung cari
const queryFromUrl = new URLSearchParams(location.search).get("q");
if (queryFromUrl) {
  searchInput.value = queryFromUrl;
  doSearch(queryFromUrl);
} else {
  loadList();
}
btnMore.addEventListener("click", () => loadPage(currentPage + 1));