/**
 * ============================================================================
 * SERVICE WATCHLIST (localStorage)
 * ============================================================================
 * Menyediakan fungsi terpusat untuk menyimpan, membaca, dan menghapus
 * film atau series dari Watchlist pengguna.
 */
const WatchlistService = {
  KEYS: {
    movie: "watchlist",
    tv: "watchlist_tv"
  },

  /**
   * Menentukan kunci localStorage berdasarkan jenis media ('movie' atau 'tv').
   */
  getKey(type = "movie") {
    return type === "tv" ? this.KEYS.tv : this.KEYS.movie;
  },

  /**
   * Mengambil semua ID dari watchlist.
   * @param {string} type - 'movie' atau 'tv'
   * @returns {number[]} Array ID film/series
   */
  getAll(type = "movie") {
    try {
      const data = localStorage.getItem(this.getKey(type));
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn("Gagal membaca localStorage:", e);
      return [];
    }
  },

  /**
   * Menyimpan array ID ke localStorage.
   */
  save(type, ids) {
    try {
      localStorage.setItem(this.getKey(type), JSON.stringify(ids));
    } catch (e) {
      console.warn("Gagal menyimpan ke localStorage:", e);
    }
  },

  /**
   * Memeriksa apakah ID tertentu ada di watchlist.
   */
  has(type, id) {
    const list = this.getAll(type);
    return list.includes(Number(id));
  },

  /**
   * Toggle (menambah jika belum ada, menghapus jika sudah ada).
   * @returns {boolean} true jika ditambahkan, false jika dihapus.
   */
  toggle(type, id) {
    const numId = Number(id);
    let list = this.getAll(type);
    const index = list.indexOf(numId);

    if (index > -1) {
      list.splice(index, 1);
      this.save(type, list);
      return false; // Dihapus
    } else {
      list.push(numId);
      this.save(type, list);
      return true; // Ditambahkan
    }
  }
};
