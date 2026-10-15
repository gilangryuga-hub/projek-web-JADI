
// 1. PENGATURAN
const API_KEY = "5675db644132bff8db5ff739e4cb76c8";                         // ganti dengan API key TMDB milikmu
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_POSTER = "https://image.tmdb.org/t/p/w500";    // poster
const IMG_BACKDROP = "https://image.tmdb.org/t/p/w1280"; // gambar latar
const IMG_PROFILE = "https://image.tmdb.org/t/p/w185";   // foto pemain

// Baca jenis & id dari alamat halaman
const params = new URLSearchParams(location.search);
const TYPE = params.get("type") === "tv" ? "tv" : "movie";
const ID = Number(params.get("id"));
const WATCH_KEY = TYPE === "tv" ? "watchlist_tv" : "watchlist";   // sama dengan halaman lain

let trailerKey = null;     // kode video YouTube untuk trailer

// Watchlist disimpan di browser
let watchlist = [];
try {
  watchlist = JSON.parse(localStorage.getItem(WATCH_KEY)) || [];
} catch (e) {
  watchlist = [];
}

// 2. ELEMEN HTML
const pageEl = document.getElementById("page");
const posterEl = document.getElementById("poster");
const titleEl = document.getElementById("title");
const metaEl = document.getElementById("meta");
const ratingEl = document.getElementById("rating");
const overviewEl = document.getElementById("overview");
const castEl = document.getElementById("cast");
const reviewsEl = document.getElementById("reviews");
const btnBack = document.getElementById("btn-back");
const btnTrailer = document.getElementById("btn-trailer");
const btnWatch = document.getElementById("btn-watchlist");
const btnNext = document.getElementById("btn-next");


// 3. FUNGSI BANTU
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

// 130 menit -> "2h 10m"
function formatRuntime(min) {
  if (!min) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

function showError(text) {
  titleEl.textContent = text;
  metaEl.textContent = "";
  ratingEl.textContent = "-";
  overviewEl.textContent = "";
  castEl.innerHTML = "";
  reviewsEl.innerHTML = "";
  btnNext.hidden = true;
}


// 4. TOMBOL

// Kembali ke halaman sebelumnya
btnBack.addEventListener("click", () => {
  if (document.referrer) history.back();
  else location.href = "index.html";
});

// Trailer: buka video YouTube di tab baru
btnTrailer.addEventListener("click", () => {
  if (trailerKey) window.open(`https://www.youtube.com/watch?v=${trailerKey}`, "_blank");
  else alert("Trailer tidak tersedia.");
});

// WatchList: tambah / hapus
function updateWatchButton() {
  btnWatch.classList.toggle("active", watchlist.includes(ID));
}

btnWatch.addEventListener("click", () => {
  if (watchlist.includes(ID)) {
    watchlist = watchlist.filter(x => x !== ID);
  } else {
    watchlist.push(ID);
  }
  try {
    localStorage.setItem(WATCH_KEY, JSON.stringify(watchlist));
  } catch (e) { /* abaikan jika penyimpanan diblokir */ }
  updateWatchButton();
});

// Panah geser review
btnNext.addEventListener("click", () => {
  reviewsEl.scrollBy({ left: reviewsEl.clientWidth * 0.8, behavior: "smooth" });
});


// 5. TAMPILKAN DATA
function render(data) {
  const title = data.title || data.name;      // film: "title", series: "name"
  document.title = `${title} - NetList`;
  titleEl.textContent = title;

  // Poster & gambar latar
  if (data.poster_path) {
    posterEl.src = IMG_POSTER + data.poster_path;
    posterEl.alt = title;
  }
  if (data.backdrop_path) {
    pageEl.style.setProperty("--detail-bg", `url(${IMG_BACKDROP + data.backdrop_path})`);
  }

  // Baris info: tahun | genre | durasi
  const year = (data.release_date || data.first_air_date || "").slice(0, 4);
  const genres = (data.genres || []).slice(0, 3).map(g => g.name);
  let durasi = "";
  if (TYPE === "movie") {
    durasi = formatRuntime(data.runtime);
  } else if (data.episode_run_time && data.episode_run_time[0]) {
    durasi = `${data.episode_run_time[0]}m / episode`;
  } else if (data.number_of_seasons) {
    durasi = `${data.number_of_seasons} Season`;
  }
  metaEl.textContent = [year, ...genres, durasi].filter(Boolean).join(" | ");

  // Rating
  ratingEl.textContent = data.vote_average ? data.vote_average.toFixed(1) + "/10" : "-";

  // Sinopsis
  overviewEl.textContent = data.overview || "Sinopsis belum tersedia.";

  // Trailer (video YouTube bertipe Trailer)
  const videos = (data.videos && data.videos.results) || [];
  const trailer = videos.find(v => v.site === "YouTube" && v.type === "Trailer");
  trailerKey = trailer ? trailer.key : null;

  // Pemain (6 pertama yang punya foto)
  const cast = ((data.credits && data.credits.cast) || [])
    .filter(c => c.profile_path)
    .slice(0, 6);

  if (cast.length === 0) {
    castEl.innerHTML = `<p class="empty">Data pemain belum tersedia.</p>`;
  } else {
    castEl.innerHTML = cast.map(c => `
      <div class="cast-card">
        <img src="${IMG_PROFILE + c.profile_path}" alt="${esc(c.name)}">
        <p class="cast-name">${esc(c.name)}</p>
        <p class="cast-role">As ${esc(c.character || "-")}</p>
      </div>
    `).join("");
  }

  // Review
  const reviews = ((data.reviews && data.reviews.results) || []).slice(0, 10);

  if (reviews.length === 0) {
    reviewsEl.innerHTML = `<p class="empty">Belum ada review.</p>`;
    btnNext.hidden = true;
  } else {
    reviewsEl.innerHTML = reviews.map(r => {
      const nilai = r.author_details && r.author_details.rating;
      return `
        <article class="review-card">
          <div class="review-head">
            <i class="fa-regular fa-circle-user"></i>
            <span class="review-author">${esc(r.author)}</span>
            ${nilai ? `<span class="review-rating"><i class="fa-solid fa-star"></i> ${nilai}</span>` : ""}
          </div>
          <p class="review-text">${esc(r.content)}</p>
        </article>`;
    }).join("");
  }

  updateWatchButton();
}


// 6. MULAI
async function init() {
  if (!ID) {
    showError("Film tidak ditemukan.");
    return;
  }

  if (API_KEY === "API_KEY_KAMU") {
    showError("API key belum diisi. Ganti API_KEY_KAMU di bagian atas detail.js.");
    return;
  }

  try {
    // Satu permintaan mengambil detail + pemain + video + review sekaligus
    const data = await getJSON(`/${TYPE}/${ID}`, "&append_to_response=credits,videos,reviews");
    render(data);
  } catch (err) {
    console.error(err);
    showError(`Gagal memuat data (${err.message}).`);
  }
}

init();
