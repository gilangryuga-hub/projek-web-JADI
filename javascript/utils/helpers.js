/**
 * ============================================================================
 * FUNGSI BANTU & UTILITAS
 * ============================================================================
 */

/**
 * Mengambil data JSON dari endpoint TMDB.
 * Otomatis menyertakan API_KEY, BASE_URL, dan bahasa default.
 * @param {string} path - Contoh: "/movie/popular"
 * @param {string} extraParams - Contoh: "&page=1"
 */
async function getJSON(path, extraParams = "") {
  if (TMDB_CONFIG.API_KEY === "API_KEY_KAMU") {
    throw new Error("API key belum diatur di javascript/config/api.js");
  }

  const url = `${TMDB_CONFIG.BASE_URL}${path}?api_key=${TMDB_CONFIG.API_KEY}&language=en-US${extraParams}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Gagal memuat data (HTTP ${res.status})`);
  }
  return res.json();
}

/**
 * Sanitasi karakter berbahaya untuk mencegah serangan XSS saat merender HTML string.
 * @param {string} text
 */
function esc(text) {
  return String(text ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

/**
 * Mengubah menit menjadi format jam & menit (contoh: 125 -> "2h 5m").
 * @param {number} min
 */
function formatRuntime(min) {
  if (!min) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}
