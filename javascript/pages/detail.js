/**
 * ============================================================================
 * HALAMAN: DETAIL (detail.html)
 * ============================================================================
 */

// Parameter dari URL (?type=movie&id=123 atau ?type=tv&id=456)
const params = new URLSearchParams(location.search);
const TYPE = params.get("type") === "tv" ? "tv" : "movie";
const ID = Number(params.get("id"));

let trailerKey = null; // Key video YouTube

// Elemen DOM
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

function showError(text) {
  titleEl.textContent = text;
  metaEl.textContent = "";
  ratingEl.textContent = "-";
  overviewEl.textContent = "";
  castEl.innerHTML = "";
  reviewsEl.innerHTML = "";
  if (btnNext) btnNext.hidden = true;
}

// Tombol Kembali
btnBack.addEventListener("click", () => {
  if (document.referrer) {
    history.back();
  } else {
    location.href = "index.html";
  }
});

// Trailer YouTube
btnTrailer.addEventListener("click", () => {
  if (trailerKey) {
    window.open(`https://www.youtube.com/watch?v=${trailerKey}`, "_blank");
  } else {
    alert("Trailer tidak tersedia.");
  }
});

// Watchlist
function updateWatchButton() {
  btnWatch.classList.toggle("active", WatchlistService.has(TYPE, ID));
}

btnWatch.addEventListener("click", () => {
  WatchlistService.toggle(TYPE, ID);
  updateWatchButton();
});

// Navigasi Geser Review
if (btnNext) {
  btnNext.addEventListener("click", () => {
    reviewsEl.scrollBy({ left: reviewsEl.clientWidth * 0.8, behavior: "smooth" });
  });
}

// ===== RENDER DATA DETAIL =====
function render(data) {
  const title = data.title || data.name || "Detail Film";
  document.title = `${title} - NetList`;
  titleEl.textContent = title;

  // Poster & Backdrop
  if (data.poster_path) {
    posterEl.src = TMDB_CONFIG.IMG_POSTER + data.poster_path;
    posterEl.alt = title;
  }
  if (data.backdrop_path) {
    pageEl.style.setProperty("--detail-bg", `url(${TMDB_CONFIG.IMG_BACKDROP + data.backdrop_path})`);
  }

  // Baris Info: Tahun | Genre | Durasi
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
  ratingEl.textContent = data.vote_average ? `${data.vote_average.toFixed(1)}/10` : "-";

  // Sinopsis
  overviewEl.textContent = data.overview || "Sinopsis belum tersedia.";

  // Cari Video Trailer
  const videos = (data.videos && data.videos.results) || [];
  const trailer = videos.find(v => v.site === "YouTube" && v.type === "Trailer");
  trailerKey = trailer ? trailer.key : null;

  // Pemain (Cast)
  const cast = ((data.credits && data.credits.cast) || [])
    .filter(c => c.profile_path)
    .slice(0, 6);

  if (cast.length === 0) {
    castEl.innerHTML = `<p class="empty">Data pemain belum tersedia.</p>`;
  } else {
    castEl.innerHTML = cast.map(c => `
      <div class="cast-card">
        <img src="${TMDB_CONFIG.IMG_PROFILE + c.profile_path}" alt="${esc(c.name)}">
        <p class="cast-name">${esc(c.name)}</p>
        <p class="cast-role">As ${esc(c.character || "-")}</p>
      </div>
    `).join("");
  }

  // Ulasan (Reviews)
  const reviews = ((data.reviews && data.reviews.results) || []).slice(0, 10);

  if (reviews.length === 0) {
    reviewsEl.innerHTML = `<p class="empty">Belum ada review.</p>`;
    if (btnNext) btnNext.hidden = true;
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

// ===== INISIALISASI =====
async function init() {
  if (!ID) {
    showError("Film atau series tidak ditemukan.");
    return;
  }

  try {
    const data = await getJSON(`/${TYPE}/${ID}`, "&append_to_response=credits,videos,reviews");
    render(data);
  } catch (err) {
    console.error(err);
    showError(`Gagal memuat data (${err.message}).`);
  }
}

init();
