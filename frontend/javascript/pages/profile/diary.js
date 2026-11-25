function initDiaryPage() {
  const status = document.getElementById("profile-status");
  const content = document.getElementById("profile-content");
  if (!status || !content) return;
  const tableBody = document.getElementById("diary-table-body");
  const actionMessage = ensureProfileActionMessage();
  let journals = [];
  const tableWrap = document.querySelector(".diary-table-wrap");
  const posterToggle = document.getElementById("diary-poster-toggle");

  function render() {
    const year = document.getElementById("diary-year-filter").value;
    const rating = document.getElementById("diary-rating-filter").value;
    const sort = document.getElementById("diary-sort-filter").value;
    const entries = journals.filter(item =>
      (year === "all" || String(item.watched_date).startsWith(year)) &&
      (rating === "all" || Number(item.rating || 0) >= Number(rating))
    );
    entries.sort((first, second) => {
      if (sort === "title") return first.title.localeCompare(second.title);
      if (sort === "rating") return Number(second.rating || 0) - Number(first.rating || 0);
      const dateOrder = String(first.watched_date).localeCompare(String(second.watched_date));
      return sort === "watched-asc" ? dateOrder : -dateOrder;
    });
    document.getElementById("diary-count").textContent = `${entries.length} entr${entries.length === 1 ? "y" : "ies"}`;
    document.getElementById("diary-table-body").innerHTML = entries.length
      ? entries.map(item => {
        const date = new Date(`${item.watched_date}T00:00:00`);
        const releaseDate = item.release_date || item.first_air_date || item.release_year || "";
        const releaseYear = String(releaseDate).slice(0, 4);
        const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
        const poster = item.poster_path
          ? `<img src="${profileEscapeHtml(profilePosterUrl(item.poster_path))}" alt="">`
          : `<span class="diary-poster-placeholder" aria-hidden="true"><i class="fa-solid fa-film"></i></span>`;
        const review = item.notes
          ? `<a class="diary-review-link" href="reviews.html" aria-label="View review for ${profileEscapeHtml(item.title)}" title="View review"><i class="fa-solid fa-align-left" aria-hidden="true"></i></a>`
          : `<span class="diary-empty-cell" aria-label="No review">—</span>`;
        return `<div class="diary-row" role="row"><div class="diary-month" role="cell"><span>${month}</span></div><div class="diary-day" role="cell"><time datetime="${profileEscapeHtml(item.watched_date)}">${date.getDate()}</time></div><div class="diary-film" role="cell">${poster}<div class="diary-film-copy"><strong>${profileEscapeHtml(item.title)}</strong><span>${item.media_type === "tv" ? "Series" : "Film"}</span></div></div><div class="diary-release" role="cell">${releaseYear || "—"}</div><div class="diary-rating" role="cell">${profileStars(item.rating)}</div><div class="diary-flag" role="cell">${item.is_liked ? '<i class="fa-solid fa-heart is-liked" aria-label="Liked" title="Liked"></i>' : '<span class="diary-empty-cell" aria-label="Not liked">—</span>'}</div><div class="diary-flag" role="cell">${item.is_rewatch ? '<i class="fa-solid fa-rotate-right is-rewatch" aria-label="Rewatch" title="Rewatch"></i>' : '<span class="diary-empty-cell" aria-label="Not a rewatch">—</span>'}</div><div class="diary-flag" role="cell">${review}</div><div class="journal-actions" role="cell"><button class="journal-action-btn" type="button" data-journal-edit="${item.id}" aria-label="Edit ${profileEscapeHtml(item.title)}" title="Edit"><i class="fa-solid fa-pen"></i></button><button class="journal-action-btn journal-action-btn--delete" type="button" data-journal-delete="${item.id}" aria-label="Delete ${profileEscapeHtml(item.title)}" title="Delete"><i class="fa-solid fa-trash"></i></button></div></div>`;
      }).join("")
      : `<p class="profile-empty diary-empty">Belum ada diary untuk filter ini.</p>`;
  }

  tableBody.addEventListener("click", async event => {
    const button = event.target.closest("[data-journal-edit], [data-journal-delete]");
    if (!button) return;
    const id = Number(button.dataset.journalEdit || button.dataset.journalDelete);
    const entry = journals.find(item => Number(item.id) === id);
    if (!entry) {
      actionMessage.textContent = "Diary entry tidak ditemukan. Muat ulang halaman dan coba lagi.";
      actionMessage.hidden = false;
      return;
    }

    if (button.hasAttribute("data-journal-edit")) {
      window.JournalModal.openForEdit(entry);
      return;
    }

    if (!window.confirm(`Hapus diary "${entry.title}"? Review dan catatan yang terkait juga akan terhapus.`)) return;
    button.disabled = true;
    actionMessage.hidden = true;
    try {
      await JournalService.remove(id);
      window.dispatchEvent(new CustomEvent("journal:changed"));
    } catch (error) {
      actionMessage.textContent = error.message || "Diary gagal dihapus.";
      actionMessage.hidden = false;
      button.disabled = false;
    }
  });

  ["diary-year-filter", "diary-rating-filter", "diary-sort-filter"].forEach(id => {
    document.getElementById(id).addEventListener("change", render);
  });

  posterToggle.addEventListener("click", () => {
    const hidden = tableWrap.classList.toggle("posters-hidden");
    const label = hidden ? "Show film posters" : "Hide film posters";
    posterToggle.setAttribute("aria-label", label);
    posterToggle.setAttribute("title", label);
    posterToggle.setAttribute("aria-pressed", String(hidden));
    posterToggle.innerHTML = `<i class="fa-solid fa-eye${hidden ? "-slash" : ""}" aria-hidden="true"></i>`;
  });

  async function load() {
    try {
      const data = await loadProfileData();
      initProfileShell(data);
      journals = data.journals;
      const yearFilter = document.getElementById("diary-year-filter");
      const selectedYear = yearFilter.value;
      const years = [...new Set(journals.map(item => String(item.watched_date || "").slice(0, 4)).filter(Boolean))];
      yearFilter.innerHTML = `<option value="all">All years</option>${years.map(year => `<option value="${year}">${year}</option>`).join("")}`;
      if (years.includes(selectedYear)) yearFilter.value = selectedYear;
      render();
      status.hidden = true;
      content.hidden = false;
    } catch (error) {
      if (error.message === "Profil membutuhkan login") renderProfileLogin(status);
      else status.textContent = error.message || "Data diary gagal dimuat.";
    }
  }

  window.addEventListener("journal:changed", load);
  load();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initDiaryPage);
else initDiaryPage();
