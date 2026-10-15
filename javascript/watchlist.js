
// 1. PENGATURAN
const API_KEY = "5675db644132bff8db5ff739e4cb76c8";                      // ganti dengan API key TMDB milikmu
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_POSTER = "https://image.tmdb.org/t/p/w500";

// Film disimpan di "watchlist", series di "watchlist_tv"
function readIds(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) {
    return [];
  }
}

function writeIds(key, ids) {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch (e) { /* abaikan jika penyimpanan diblokir */ }
}

let movies = [];   // data detail film di watchlist
let series = [];   // data detail series di watchlist

const container = document.getElementById("watch-content");
const searchInput = document.getElementById("search-input");


// 2. FUNGSI BANTU
async function getJSON(path) {
  const res = await fetch(`${BASE_URL}${path}?api_key=${API_KEY}&language=en-US`);
  if (!res.ok) throw new Error("kode " + res.status);
  return res.json();
}

function esc(text) {
  return String(text).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

// Ambil detail untuk banyak id sekaligus (yang gagal diabaikan)
async function fetchDetails(type, ids) {
  const results = await Promise.all(
    ids.map(id => getJSON(`/${type}/${id}`).catch(() => null))
  );
  return results.filter(Boolean);
}


// 3. TAMPILKAN
function cardsHTML(items) {
  return items.filter(m => m.poster_path).map(m => `
    <div class="movie-card" data-id="${m.id}">
      <img src="${IMG_POSTER + m.poster_path}" alt="${esc(m.title || m.name)}">
      <span class="rating"><i class="fa-solid fa-star"></i> ${m.vote_average.toFixed(1)}/10</span>
      <button class="bookmark active" aria-label="Hapus dari watchlist">
        <i class="fa-solid fa-bookmark"></i>
      </button>
    </div>`).join("");
}

function render() {
  // Kosong semua -> tampilkan pesan
  if (movies.length === 0 && series.length === 0) {
    container.innerHTML = `<p class="empty">WatchList masih kosong.<br>Klik ikon bookmark pada film atau series untuk menyimpannya di sini.</p>`;
    return;
  }

  let html = "";

  if (movies.length) {
    html += `<h2 class="content-subtitle">Movies</h2>
             <div class="movie-grid" data-type="movie">${cardsHTML(movies)}</div>`;
  }
  if (series.length) {
    html += `<h2 class="content-subtitle">Series</h2>
             <div class="movie-grid" data-type="tv">${cardsHTML(series)}</div>`;
  }

  container.innerHTML = html;
}


// 4. HAPUS DARI WATCHLIST
container.addEventListener("click", (e) => {
  const btn = e.target.closest(".bookmark");

  if (!btn) {
    const card = e.target.closest(".movie-card");
    if (card) {
      const type = card.closest(".movie-grid").dataset.type;
      location.href = `detail.html?type=${type}&id=${card.dataset.id}`;
    }
    return;
  }


  const id = Number(btn.closest(".movie-card").dataset.id);
  const type = btn.closest(".movie-grid").dataset.type;

  if (type === "tv") {
    series = series.filter(s => s.id !== id);
    writeIds("watchlist_tv", series.map(s => s.id));
  } else {
    movies = movies.filter(m => m.id !== id);
    writeIds("watchlist", movies.map(m => m.id));
  }
  render();
});


// 5. SEARCH
// Dari halaman ini, search membuka halaman Movies dengan kata kunci
searchInput.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const q = searchInput.value.trim();
  if (q) location.href = "movies.html?q=" + encodeURIComponent(q);
});


// 6. MULAI
async function init() {
  const movieIds = readIds("watchlist");
  const seriesIds = readIds("watchlist_tv");

  if (movieIds.length === 0 && seriesIds.length === 0) {
    render();
    return;
  }

  if (API_KEY === "API_KEY_KAMU") {
    container.innerHTML = `<p class="empty">API key belum diisi. Ganti API_KEY_KAMU di bagian atas watchlist.js.</p>`;
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
