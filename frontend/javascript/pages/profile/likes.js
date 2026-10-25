function initLikesPage() {
  const status = document.getElementById("profile-status");
  const content = document.getElementById("profile-content");
  if (!status || !content) return;

  loadProfileData().then(data => {
    initProfileShell(data);
    const liked = data.journals.filter(item => item.is_liked);
    document.getElementById("likes-count").textContent = `${liked.length} film${liked.length === 1 ? "" : "s"}`;
    document.getElementById("favorite-grid").innerHTML = liked.length
      ? liked.map(item => `<a class="poster-card" href="${getPageUrl(`detail.html?type=${item.media_type}&id=${item.tmdb_id}`)}"><img src="${profilePosterUrl(item.poster_path)}" alt="Poster film ${profileEscapeHtml(item.title)}"><span>${profileEscapeHtml(item.title)}</span></a>`).join("")
      : `<p class="profile-empty">Belum ada film yang disukai.</p>`;
    status.hidden = true;
    content.hidden = false;
  }).catch(error => {
    if (error.message === "Profil membutuhkan login") renderProfileLogin(status);
    else status.textContent = error.message || "Data likes gagal dimuat.";
  });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initLikesPage);
else initLikesPage();
