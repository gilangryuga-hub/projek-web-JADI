import { API_CONFIG } from '../config/api.js';

// Menggunakan variabel dari config, bukan string hardcode
export async function fetchData(endpoint) {
  const response = await fetch(`${API_CONFIG.DJANGO_BASE_URL}${endpoint}`);
  return response.json();
}

/**
 * Mengambil access token yang sedang tersimpan.
 * @returns {string|null} Access token atau null jika belum login.
 */
function getAccessToken() {
  return localStorage.getItem(API_CLIENT_CONFIG.accessTokenKey);
}

/**
 * Menghapus token dan memberi tahu UI bahwa sesi telah berakhir.
 * @returns {void}
 */
function clearAuthSession() {
  localStorage.removeItem(API_CLIENT_CONFIG.accessTokenKey);
  localStorage.removeItem(API_CLIENT_CONFIG.refreshTokenKey);
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
  localStorage.setItem(API_CLIENT_CONFIG.accessTokenKey, tokens.access);
  if (tokens.refresh) {
    localStorage.setItem(API_CLIENT_CONFIG.refreshTokenKey, tokens.refresh);
  }
}

/**
 * Meminta access token baru menggunakan refresh token.
 * @returns {Promise<boolean>} True jika refresh berhasil.
 */
async function refreshAccessToken() {
  const refresh = localStorage.getItem(API_CLIENT_CONFIG.refreshTokenKey);
  if (!refresh) {
    return false;
  }

  const response = await fetch(
    `${API_CLIENT_CONFIG.baseUrl}/api/auth/token/refresh/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh })
    }
  );

  if (!response.ok) {
    return false;
  }

  const tokens = await response.json();
  saveAuthTokens({ access: tokens.access });
  return true;
}

/**
 * Menjalankan request HTTP dengan Authorization Bearer otomatis.
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
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_CLIENT_CONFIG.baseUrl}${path}`, {
    ...options,
    headers
  });

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

  if (response.status === 204) {
    return null;
  }
  return response.json();
}
