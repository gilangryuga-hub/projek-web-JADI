function initReviewsPage() {
  const status = document.getElementById("profile-status");
  const content = document.getElementById("profile-content");
  if (!status || !content) return;
  const reviewList = document.getElementById("review-list");
  const actionMessage = ensureProfileActionMessage();
  let journals = [];

  function render() {
    const reviews = journals.filter(item => item.notes);
    document.getElementById("review-count").textContent = `${reviews.length} review${reviews.length === 1 ? "" : "s"}`;
    document.getElementById("review-list").innerHTML = reviews.length
      ? reviews.map(item => `<article class="review-card"><div class="review-poster">${item.poster_path ? `<img src="${profilePosterUrl(item.poster_path)}" alt="Poster ${profileEscapeHtml(item.title)}">` : ""}</div><div class="review-body"><div class="review-meta"><span>${profileEscapeHtml(item.title)}</span><span>${item.watched_date || "-"}</span></div>${profileStars(item.rating)}<p>${profileEscapeHtml(item.notes)}</p></div><div class="journal-actions review-actions"><button class="journal-action-btn" type="button" data-journal-edit="${item.id}" aria-label="Edit review" title="Edit"><i class="fa-solid fa-pen"></i><span>Edit</span></button><button class="journal-action-btn journal-action-btn--delete" type="button" data-journal-delete="${item.id}" aria-label="Delete review" title="Delete"><i class="fa-solid fa-trash"></i><span>Delete</span></button></div></article>`).join("")
      : `<p class="profile-empty">Belum ada review. Isi catatan saat menambahkan diary.</p>`;
  }

  reviewList.addEventListener("click", async event => {
    const button = event.target.closest("[data-journal-edit], [data-journal-delete]");
    if (!button) return;
    const id = Number(button.dataset.journalEdit || button.dataset.journalDelete);
    const entry = journals.find(item => Number(item.id) === id);
    if (!entry) {
      actionMessage.textContent = "Review tidak ditemukan. Muat ulang halaman dan coba lagi.";
      actionMessage.hidden = false;
      return;
    }

    if (button.hasAttribute("data-journal-edit")) {
      window.JournalModal.openForEdit(entry);
      return;
    }

    if (!window.confirm(`Hapus review untuk "${entry.title}"? Entri diary dan rating tetap tersimpan.`)) return;
    button.disabled = true;
    actionMessage.hidden = true;
    try {
      await JournalService.update(id, {
        tmdb_id: entry.tmdb_id,
        media_type: entry.media_type,
        title: entry.title,
        poster_path: entry.poster_path || "",
        rating: Number(entry.rating),
        notes: "",
        watched_date: entry.watched_date,
        is_rewatch: Boolean(entry.is_rewatch),
        is_liked: Boolean(entry.is_liked),
        contains_spoilers: Boolean(entry.contains_spoilers)
      });
      window.dispatchEvent(new CustomEvent("journal:changed"));
    } catch (error) {
      actionMessage.textContent = error.message || "Review gagal dihapus.";
      actionMessage.hidden = false;
      button.disabled = false;
    }
  });

  async function load() {
    try {
      const data = await loadProfileData();
      initProfileShell(data);
      journals = data.journals;
      render();
      status.hidden = true;
      content.hidden = false;
    } catch (error) {
      if (error.message === "Profil membutuhkan login") renderProfileLogin(status);
      else status.textContent = error.message || "Data reviews gagal dimuat.";
    }
  }

  window.addEventListener("journal:changed", load);
  load();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initReviewsPage);
else initReviewsPage();
