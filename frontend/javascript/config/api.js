const TMDB_CONFIG = {
  API_KEY: "5675db644132bff8db5ff739e4cb76c8",
  BASE_URL: "https://api.themoviedb.org/3",
  IMG_POSTER: "https://image.tmdb.org/t/p/w500",     // Ukuran poster (lebar 500px)
  IMG_BACKDROP: "https://image.tmdb.org/t/p/w1280",  // Ukuran banner latar (lebar 1280px)
  IMG_PROFILE: "https://image.tmdb.org/t/p/w185"     // Ukuran foto pemain (lebar 185px)
};

export const API_CONFIG = {
  DJANGO_BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000",
  TMDB_BASE_URL: "https://api.themoviedb.org/3",
  TMDB_API_KEY: process.env.NEXT_PUBLIC_TMDB_KEY,
};