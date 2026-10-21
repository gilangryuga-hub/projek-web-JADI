/**
 * Service watchlist yang terhubung ke Django REST API.
 */
const WatchlistService = {
  items: [],

  /**
   * Memeriksa item yang sudah ada di cache.
   * @param {string} type - `movie` atau `tv`.
   * @param {number|string} tmdbId - ID TMDB.
   * @returns {boolean} True jika item ada.
   */
  has(type, tmdbId) {
    return Boolean(this.find(type, tmdbId));
  },

  /**
   * Mengambil watchlist user aktif dan menyimpannya sebagai cache UI.
   * @returns {Promise<object[]>} Daftar item watchlist.
   */
  async getAll() {
    this.items = await apiRequest("/api/watchlist/");
    return this.items;
  },

  /**
   * Memeriksa item berdasarkan TMDB ID dari cache yang sudah dimuat.
   * @param {string} type - `movie` atau `tv`.
   * @param {number|string} tmdbId - ID TMDB.
   * @returns {object|undefined} Item watchlist jika ditemukan.
   */
  find(type, tmdbId) {
    return this.items.find(
      item => item.media_type === type && Number(item.tmdb_id) === Number(tmdbId)
    );
  },

  /**
   * Menambahkan film atau series ke watchlist API.
   * @param {{tmdb_id: number, media_type: string, title?: string, poster_path?: string}} data - Data media.
   * @returns {Promise<object>} Item yang dibuat.
   */
  async add(data) {
    const item = await apiRequest("/api/watchlist/", {
      method: "POST",
      body: JSON.stringify(data)
    });
    this.items.push(item);
    return item;
  },

  /**
   * Menghapus item watchlist berdasarkan ID instance API.
   * @param {number} id - ID item watchlist dari backend.
   * @returns {Promise<null>} Respons kosong dari API.
   */
  async remove(id) {
    const result = await apiRequest(`/api/watchlist/${id}/`, { method: "DELETE" });
    this.items = this.items.filter(item => item.id !== id);
    return result;
  },

  /**
   * Menambah atau menghapus media dari watchlist.
   * @param {{id: number, title?: string, poster_path?: string}} media - Data TMDB.
   * @param {string} type - `movie` atau `tv`.
   * @returns {Promise<boolean>} True jika ditambahkan, false jika dihapus.
   */
  async toggle(media, type) {
    const normalizedMedia = typeof media === "object" ? media : { id: media };
    const current = this.find(type, normalizedMedia.id);
    if (current) {
      await this.remove(current.id);
      return false;
    }
    await this.add({
      tmdb_id: normalizedMedia.id,
      media_type: type,
      title: normalizedMedia.title || normalizedMedia.name || "",
      poster_path: normalizedMedia.poster_path || ""
    });
    return true;
  }
};
