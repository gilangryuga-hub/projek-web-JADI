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
 * Menormalkan teks untuk perbandingan pencarian.
 * @param {string} text
 * @returns {string}
 */
function normalizeSearchText(text) {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Menghitung jarak Levenshtein antara dua teks.
 * @param {string} first
 * @param {string} second
 * @returns {number}
 */
function levenshteinDistance(first, second) {
  const a = normalizeSearchText(first);
  const b = normalizeSearchText(second);
  const rows = a.length + 1;
  const columns = b.length + 1;
  const matrix = Array.from({ length: rows }, () => Array(columns).fill(0));

  for (let i = 0; i < rows; i++) matrix[i][0] = i;
  for (let j = 0; j < columns; j++) matrix[0][j] = j;

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < columns; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}

/**
 * Mencari judul paling mirip untuk menampilkan status "Did you mean".
 * @param {string} query
 * @param {object[]} items
 * @param {string} type
 * @returns {{query: string, title: string}|null}
 */
function findSearchSuggestion(query, items, type = "movie") {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return null;

  let bestMatch = null;

  for (const item of (items || []).slice(0, 20)) {
    const title = type === "tv" ? item.name : item.title;
    const normalizedTitle = normalizeSearchText(title);
    if (!normalizedTitle || normalizedQuery === normalizedTitle) continue;

    const titleWords = normalizedTitle.split(" ");
    const queryWordCount = normalizedQuery.split(" ").length;

    const exactPrefix = titleWords
      .slice(0, queryWordCount)
      .join(" ");
    if (normalizedQuery === exactPrefix && normalizedQuery.length === exactPrefix.length) {
      continue;
    }

    if (
      normalizedQuery.length >= 3 &&
      (
        normalizedTitle.startsWith(normalizedQuery) ||
        titleWords.some(word => word.startsWith(normalizedQuery))
      )
    ) {
      if (!bestMatch || 1 > bestMatch.similarity) {
        bestMatch = { title, similarity: 1 };
      }
      continue;
    }

    const titleCandidates = [
      normalizedTitle,
      titleWords.slice(0, queryWordCount).join(" "),
      titleWords.slice(0, Math.max(queryWordCount + 2, 3)).join(" "),
    ];

    for (let candidateIndex = 0; candidateIndex < titleCandidates.length; candidateIndex++) {
      const candidate = titleCandidates[candidateIndex];
      if (!candidate) continue;
      const distance = levenshteinDistance(normalizedQuery, candidate);
      const longestLength = Math.max(normalizedQuery.length, candidate.length);
      const similarity = 1 - distance / longestLength;
      const allowedDistance = normalizedQuery.length >= 8
        ? Math.max(2, Math.floor(normalizedQuery.length * 0.25))
        : 2;

      if (
        similarity >= 0.72 &&
        distance <= allowedDistance &&
        (!bestMatch || similarity > bestMatch.similarity)
      ) {
        const suggestionTitle = candidateIndex === 0
          ? title
          : title.split(/\s+/).slice(0, titleCandidates[candidateIndex].split(" ").length).join(" ");
        bestMatch = { title: suggestionTitle, similarity };
      }
    }
  }

  return bestMatch ? { query, title: bestMatch.title } : null;
}

/**
 * Menampilkan status pencarian dan saran koreksi teks.
 * @param {HTMLElement} titleElement
 * @param {string} query
 * @param {object[]} items
 * @param {string} type
 * @param {(title: string) => void} onSuggestion
 */
function renderSearchStatus(titleElement, query, items, type, onSuggestion) {
  if (!titleElement) return;

  const suggestion = findSearchSuggestion(query, items, type);
  titleElement.replaceChildren();

  if (!suggestion) {
    titleElement.textContent = `Hasil pencarian: "${query}"`;
    return;
  }

  titleElement.append("Did you mean '");
  const button = document.createElement("button");
  button.type = "button";
  button.className = "search-suggestion";
  button.textContent = suggestion.title;
  button.addEventListener("click", () => onSuggestion(suggestion.title));
  titleElement.append(button, "'?");
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

/**
 * Menghasilkan URL relatif yang sesuai untuk navigasi antar halaman,
 * memperhitungkan apakah halaman saat ini berada di root atau di dalam folder 'pages/'.
 * @param {string} target - Contoh: "detail.html?id=123", "index.html", "movies.html"
 */
function getPageUrl(target) {
  const normalizedPath = window.location.pathname.replace(/\\/g, "/");
  const inPages = normalizedPath.includes("/pages/");
  const isNestedInPages = inPages && normalizedPath.split("/pages/")[1]?.includes("/");
  const [page, query] = target.split("?");
  const queryStr = query ? `?${query}` : "";

  if (page === "index.html") {
    if (isNestedInPages) return `../../index.html${queryStr}`;
    return (inPages ? "../index.html" : "index.html") + queryStr;
  }

  if (isNestedInPages) {
    return `../${page}${queryStr}`;
  }
  return (inPages ? page : `pages/${page}`) + queryStr;
}

