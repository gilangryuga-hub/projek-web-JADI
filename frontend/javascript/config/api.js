/**
 * ============================================================================
 * KONFIGURASI API TMDB
 * ============================================================================
 * Single Source of Truth untuk API Key dan URL endpoint TMDB.
 * Jika ingin mengganti API key, cukup ganti di file ini saja.
 */
const TMDB_CONFIG = {
  API_KEY: "5675db644132bff8db5ff739e4cb76c8",
  BASE_URL: "https://api.themoviedb.org/3",
  IMG_POSTER: "https://image.tmdb.org/t/p/w500",     // Ukuran poster (lebar 500px)
  IMG_BACKDROP: "https://image.tmdb.org/t/p/w1280",  // Ukuran banner latar (lebar 1280px)
  IMG_PROFILE: "https://image.tmdb.org/t/p/w185"     // Ukuran foto pemain (lebar 185px)
};
