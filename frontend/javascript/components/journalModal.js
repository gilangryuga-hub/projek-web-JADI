/**
 * Handler modal pembuatan dan pengeditan jurnal.
 */
function initJournalModal() {
  const modal = document.createElement("div");
  modal.className = "app-modal";
  modal.id = "journal-modal";
  modal.hidden = true;
  modal.innerHTML = `
    <div class="app-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="journal-modal-title">
      <button class="app-modal__close" type="button" data-journal-close aria-label="Tutup">&times;</button>
      <h2 id="journal-modal-title">Tambah ke Jurnal</h2>
      <form id="journal-form">
        <input type="hidden" name="tmdb_id">
        <input type="hidden" name="media_type">
        <input type="hidden" name="title">
        <input type="hidden" name="poster_path">
        <label>Rating
          <input name="rating" type="number" min="0.5" max="5" step="0.5" required>
        </label>
        <label>Tanggal menonton<input name="watched_date" type="date" required></label>
        <label>Catatan<textarea name="notes" rows="4"></textarea></label>
        
        <!-- BAGIAN CHECKBOX YANG DIPERBARUI -->
        <div class="options-group">
          <label class="opt--rewatch">
            <input name="is_rewatch" type="checkbox">
            <i class="fa-solid fa-rotate-right opt-icon"></i>
            <span>Rewatch</span>
          </label>
          
          <label class="opt--like">
            <input name="is_liked" type="checkbox">
            <i class="fa-solid fa-heart opt-icon"></i>
            <span>Disukai</span>
          </label>
          
          <label class="opt--spoiler">
            <input name="contains_spoilers" type="checkbox">
            <i class="fa-solid fa-eye-slash opt-icon"></i>
            <span>Spoiler</span> <!-- Diperpendek agar muat horizontal -->
          </label>
        </div>
        <!-- ================================================= -->
        
        <p class="app-modal__error" data-journal-error role="alert"></p>
        <button type="submit" class="btn-primary">Simpan</button>
      </form>
    </div>`;
  document.body.appendChild(modal);

  const form = modal.querySelector("#journal-form");
  const error = modal.querySelector("[data-journal-error]");

  /**
   * Membuka modal jurnal untuk media tertentu.
   * @param {object} media - Data media dari TMDB.
   * @param {string} type - `movie` atau `tv`.
   * @returns {void}
   */
  function open(media, type) {
    form.reset();
    form.elements.tmdb_id.value = media.id;
    form.elements.media_type.value = type;
    form.elements.title.value = media.title || media.name || "";
    form.elements.poster_path.value = media.poster_path || "";
    form.elements.watched_date.value = new Date().toISOString().slice(0, 10);
    error.textContent = "";
    modal.hidden = false;
    form.elements.rating.focus();
  }

  /**
   * Menutup modal jurnal.
   * @returns {void}
   */
  function close() {
    modal.hidden = true;
  }

  modal.addEventListener("click", (event) => {
    if (event.target === modal || event.target.closest("[data-journal-close]"))
      close();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    error.textContent = "";
    const data = Object.fromEntries(new FormData(form));
    data.tmdb_id = Number(data.tmdb_id);
    data.rating = Number(data.rating);
    data.is_rewatch = form.elements.is_rewatch.checked;
    data.is_liked = form.elements.is_liked.checked;
    data.contains_spoilers = form.elements.contains_spoilers.checked;
    try {
      await JournalService.create(data);
      close();
      window.dispatchEvent(new CustomEvent("journal:changed"));
    } catch (requestError) {
      error.textContent = requestError.message;
    }
  });

  window.JournalModal = { open, close };
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initJournalModal);
} else {
  initJournalModal();
}
