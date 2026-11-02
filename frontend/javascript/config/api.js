const TMDB_CONFIG = {
  API_KEY: "5675db644132bff8db5ff739e4cb76c8",
  BASE_URL: "https://api.themoviedb.org/3",
  IMG_POSTER: "https://image.tmdb.org/t/p/w500",
  IMG_BACKDROP: "https://image.tmdb.org/t/p/w1280",
  IMG_PROFILE: "https://image.tmdb.org/t/p/w185"
};

const IS_LOCAL_ENVIRONMENT = ["localhost", "127.0.0.1", "::1", ""].includes(
  window.location.hostname
);

const API_CONFIG = {
  DJANGO_BASE_URL: IS_LOCAL_ENVIRONMENT
    ? "http://127.0.0.1:8000"
    : "https://muhammadnaufaldzaky.pythonanywhere.com",
  ACCESS_TOKEN_KEY: "netlist_access_token",
  REFRESH_TOKEN_KEY: "netlist_refresh_token",
};

// frontend/javascript/config/api.js
const ENDPOINTS = {
  trendingWeekly: '/trending/movie/week',
};

window.TMDB_CONFIG = TMDB_CONFIG;
window.API_CONFIG = API_CONFIG;