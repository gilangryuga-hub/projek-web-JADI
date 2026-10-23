// Client HTTP untuk API Django yang dipakai oleh semua halaman frontend.
async function fetchData(endpoint) {
  const response = await fetch(`${API_CONFIG.DJANGO_BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`Gagal memuat data API (HTTP ${response.status}).`);
  }
  return response.json();
}

/**
 * Mengambil access token yang sedang tersimpan.
 * @returns {string|null} Access token atau null jika belum login.
 */
function getAccessToken() {
  return localStorage.getItem(API_CONFIG.ACCESS_TOKEN_KEY);
}

/**
 * Menghapus token dan memberi tahu UI bahwa sesi telah berakhir.
 * @returns {void}
 */
function clearAuthSession() {
  localStorage.removeItem(API_CONFIG.ACCESS_TOKEN_KEY);
  localStorage.removeItem(API_CONFIG.REFRESH_TOKEN_KEY);
  window.dispatchEvent(new CustomEvent("auth:logout"));
}

/**
 * Menyimpan pasangan token JWT.
 * @param {{access: string, refresh?: string}} tokens - Token dari API.
 * @returns {void}
 */
function saveAuthTokens(tokens) {
  if (!tokens || !tokens.access) {
    throw new Error("Respons autentikasi tidak berisi access token.");
  }
  localStorage.setItem(API_CONFIG.ACCESS_TOKEN_KEY, tokens.access);
  if (tokens.refresh) {
    localStorage.setItem(API_CONFIG.REFRESH_TOKEN_KEY, tokens.refresh);
  }
}

/**
 * Meminta access token baru menggunakan refresh token.
 * @returns {Promise<boolean>} True jika refresh berhasil.
 */
async function refreshAccessToken() {
  const refresh = localStorage.getItem(API_CONFIG.REFRESH_TOKEN_KEY);
  if (!refresh) return false;

  const response = await fetch(
    `${API_CONFIG.DJANGO_BASE_URL}/api/auth/token/refresh/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh })
    }
  );

  if (!response.ok) return false;

  const tokens = await response.json();
  saveAuthTokens({ access: tokens.access });
  return true;
}

/**
 * Menjalankan request HTTP dengan Authorization Bearer.
 * Request 401 akan di-refresh dan dicoba ulang satu kali.
 * @param {string} path - Path API, misalnya `/api/auth/me/`.
 * @param {RequestInit} [options={}] - Opsi native fetch.
 * @param {boolean} [isRetry=false] - Penanda internal agar tidak loop.
 * @returns {Promise<any>} Payload JSON atau null untuk respons 204.
 * @throws {Error} Jika response API bukan status sukses.
 */
async function apiRequest(path, options = {}, isRetry = false) {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const accessToken = getAccessToken();
  if (accessToken) {
    headers.set("Authorization", "Bearer " + accessToken);
  }

  let response;
  try {
    response = await fetch(`${API_CONFIG.DJANGO_BASE_URL}${path}`, {
      ...options,
      headers
    });
  } catch (error) {
    throw new Error(
      `Backend tidak dapat dihubungi. Jalankan Django dengan "python manage.py runserver" dari folder backend.`
    );
  }

  if (response.status === 401 && !isRetry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest(path, options, true);
    }
    clearAuthSession();
  }

  if (!response.ok) {
    let detail = `Request gagal (${response.status}).`;
    try {
      const payload = await response.json();
      detail = payload.detail || Object.values(payload).flat().join(" ") || detail;
    } catch (error) {
      console.warn("Respons error API bukan JSON.", error);
    }
    throw new Error(detail);
  }

  if (response.status === 204) return null;
  return response.json();
}

// File ini dimuat sebagai skrip biasa oleh semua halaman frontend.
window.apiRequest = apiRequest;
window.fetchData = fetchData;
window.saveAuthTokens = saveAuthTokens;
window.clearAuthSession = clearAuthSession;
