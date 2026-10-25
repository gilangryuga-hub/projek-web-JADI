function initFilmsPage() {
  const status = document.getElementById("profile-status");
  const content = document.getElementById("profile-content");
  if (!status || !content) return;

  const render = ({ journals, watchlist }) => {
    const rating = document.getElementById("films-rating-filter").value;
    const state = document.getElementById("films-status-filter").value;
    const sort = document.getElementById("films-sort").value;
    const watched = journals.map(item => ({ ...item, source: "watched" }));
    const saved = watchlist
      .filter(item => !journals.some(journal => journal.tmdb_id === item.tmdb_id && journal.media_type === item.media_type))
      .map(item => ({ ...item, source: "watchlist", rating: null }));
    let films = [...watched, ...saved].filter(item => state === "all" || item.source === state);
    if (state !== "watchlist" && rating !== "all") films = films.filter(item => Number(item.rating || 0) >= Number(rating));
    if (sort === "name") films.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "rating") films.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    document.getElementById("films-count").textContent = `${films.length} film${films.length === 1 ? "" : "s"}`;
    document.getElementById("films-grid").innerHTML = films.length
      ? films.map(item => `<a class="film-tile" href="${getPageUrl(`detail.html?type=${item.media_type}&id=${item.tmdb_id}`)}"><div class="film-tile-poster">${item.poster_path ? `<img src="${profilePosterUrl(item.poster_path)}" alt="Poster ${profileEscapeHtml(item.title)}">` : `<i class="fa-solid fa-film"></i>`}<span class="film-tile-overlay">${item.source === "watchlist" ? "Watchlist" : "Watched"}</span></div><strong>${profileEscapeHtml(item.title)}</strong><span>${item.rating ? profileStars(item.rating) : "Belum diberi rating"}</span></a>`).join("")
      : `<p class="profile-empty">Belum ada film untuk filter ini.</p>`;
  };

  ["films-rating-filter", "films-status-filter", "films-sort"].forEach(id => {
    document.getElementById(id).addEventListener("change", () => load());
  });

  async function load() {
    try {
      const data = await loadProfileData();
      initProfileShell(data);
      render(data);
      status.hidden = true;
      content.hidden = false;
    } catch (error) {
      content.hidden = true;
      status.hidden = false;
      if (error.message === "Profil membutuhkan login") renderProfileLogin(status);
      else status.textContent = error.message || "Data films gagal dimuat.";
    }
  }

  load();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initFilmsPage);
else initFilmsPage();
