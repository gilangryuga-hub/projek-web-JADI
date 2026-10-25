function initDiaryPage() {
  const status = document.getElementById("profile-status");
  const content = document.getElementById("profile-content");
  if (!status || !content) return;

  function render(journals) {
    const year = document.getElementById("diary-year-filter").value;
    const rating = document.getElementById("diary-rating-filter").value;
    const entries = journals.filter(item =>
      (year === "all" || String(item.watched_date).startsWith(year)) &&
      (rating === "all" || Number(item.rating || 0) >= Number(rating))
    );
    document.getElementById("diary-count").textContent = `${entries.length} entr${entries.length === 1 ? "y" : "ies"}`;
    document.getElementById("diary-table-body").innerHTML = entries.length
      ? entries.map(item => {
        const date = new Date(`${item.watched_date}T00:00:00`);
        return `<div class="diary-row" role="row"><div class="diary-date"><strong>${date.getDate()}</strong><span>${date.toLocaleString("id-ID", { month: "short" }).toUpperCase()}</span><small>${date.getFullYear()}</small></div><div class="diary-film"><strong>${profileEscapeHtml(item.title)}</strong><span>${item.media_type === "tv" ? "Series" : "Film"}${item.notes ? " • Review tersedia" : ""}</span></div><div>${profileStars(item.rating)}</div><div class="diary-activity">${item.is_liked ? '<i class="fa-solid fa-heart is-liked" title="Liked"></i>' : '<i class="fa-regular fa-heart" title="Not liked"></i>'}${item.is_rewatch ? '<span class="rewatch-badge">Rewatch</span>' : ""}</div></div>`;
      }).join("")
      : `<p class="profile-empty">Belum ada diary untuk filter ini.</p>`;
  }

  async function load() {
    try {
      const data = await loadProfileData();
      initProfileShell(data);
      const years = [...new Set(data.journals.map(item => String(item.watched_date || "").slice(0, 4)).filter(Boolean))];
      document.getElementById("diary-year-filter").innerHTML = `<option value="all">All years</option>${years.map(year => `<option value="${year}">${year}</option>`).join("")}`;
      ["diary-year-filter", "diary-rating-filter"].forEach(id => document.getElementById(id).addEventListener("change", () => render(data.journals)));
      render(data.journals);
      status.hidden = true;
      content.hidden = false;
    } catch (error) {
      if (error.message === "Profil membutuhkan login") renderProfileLogin(status);
      else status.textContent = error.message || "Data diary gagal dimuat.";
    }
  }

  load();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initDiaryPage);
else initDiaryPage();
