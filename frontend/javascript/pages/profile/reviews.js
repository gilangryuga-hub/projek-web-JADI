function initReviewsPage() {
  const status = document.getElementById("profile-status");
  const content = document.getElementById("profile-content");
  if (!status || !content) return;

  loadProfileData().then(data => {
    initProfileShell(data);
    const reviews = data.journals.filter(item => item.notes);
    document.getElementById("review-count").textContent = `${reviews.length} review${reviews.length === 1 ? "" : "s"}`;
    document.getElementById("review-list").innerHTML = reviews.length
      ? reviews.map(item => `<article class="review-card"><div class="review-poster">${item.poster_path ? `<img src="${profilePosterUrl(item.poster_path)}" alt="Poster ${profileEscapeHtml(item.title)}">` : ""}</div><div class="review-body"><div class="review-meta"><span>${profileEscapeHtml(item.title)}</span><span>${item.watched_date || "-"}</span></div>${profileStars(item.rating)}<p>${profileEscapeHtml(item.notes)}</p></div></article>`).join("")
      : `<p class="profile-empty">Belum ada review. Isi catatan saat menambahkan diary.</p>`;
    status.hidden = true;
    content.hidden = false;
  }).catch(error => {
    if (error.message === "Profil membutuhkan login") renderProfileLogin(status);
    else status.textContent = error.message || "Data reviews gagal dimuat.";
  });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initReviewsPage);
else initReviewsPage();
