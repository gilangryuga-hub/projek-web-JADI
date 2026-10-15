/**
 * ============================================================================
 * KOMPONEN KARTU FILM & SERIES (Card Component)
 * ============================================================================
 * Menyediakan fungsi render HTML kartu film serta penanganan event klik
 * untuk navigasi ke detail dan bookmark watchlist.
 */

/**
 * Membuat string HTML untuk satu kartu film atau series.
 * @param {object} item - Data film dari TMDB
 * @param {string} type - 'movie' atau 'tv'
 */
function createCardHTML(item, type = "movie") {
  const title = item.title || item.name || "Untitled";
  const rating = item.vote_average ? item.vote_average.toFixed(1) : "0.0";
  const isBookmarked = WatchlistService.has(type, item.id);
  const posterUrl = item.poster_path ? `${TMDB_CONFIG.IMG_POSTER}${item.poster_path}` : "";

  return `
    <div class="movie-card" data-id="${item.id}" data-type="${type}">
      <img src="${posterUrl}" alt="${esc(title)}" loading="lazy">
      <span class="rating"><i class="fa-solid fa-star"></i> ${rating}/10</span>
      <button class="bookmark ${isBookmarked ? "active" : ""}" aria-label="Watchlist">
        <i class="fa-solid fa-bookmark"></i>
      </button>
    </div>
  `;
}

/**
 * Mendaftarkan event listener pada container grid menggunakan Event Delegation.
 * Mengatur klik pada kartu menuju detail.html, dan klik tombol bookmark ke Watchlist.
 * @param {HTMLElement} gridElement
 * @param {function} [onBookmarkToggle] - Callback opsional ketika bookmark di-klik
 */
function attachCardListeners(gridElement, onBookmarkToggle = null) {
  if (!gridElement) return;

  gridElement.addEventListener("click", (e) => {
    const btn = e.target.closest(".bookmark");

    // Jika yang diklik adalah kartu (bukan tombol bookmark), buka halaman detail
    if (!btn) {
      const card = e.target.closest(".movie-card");
      if (card) {
        const type = card.dataset.type || gridElement.dataset.type || "movie";
        location.href = `detail.html?type=${type}&id=${card.dataset.id}`;
      }
      return;
    }

    // Jika yang diklik adalah tombol bookmark
    const card = btn.closest(".movie-card");
    const id = Number(card.dataset.id);
    const type = card.dataset.type || gridElement.dataset.type || "movie";

    const isAdded = WatchlistService.toggle(type, id);
    btn.classList.toggle("active", isAdded);

    if (typeof onBookmarkToggle === "function") {
      onBookmarkToggle(id, isAdded, type);
    }
  });
}
