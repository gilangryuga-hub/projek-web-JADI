/**
 * Service CRUD jurnal tontonan.
 */
const JournalService = {
  /**
   * Mengambil seluruh jurnal user aktif.
   * @returns {Promise<object[]>} Daftar jurnal.
   */
  async getAll() {
    return apiRequest("/api/journals/");
  },

  /**
   * Membuat jurnal tontonan baru.
   * @param {object} data - Data jurnal termasuk rating 0.5 sampai 5.0.
   * @returns {Promise<object>} Jurnal baru.
   */
  async create(data) {
    return apiRequest("/api/journals/", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  /**
   * Memperbarui jurnal secara penuh.
   * @param {number} id - ID jurnal.
   * @param {object} data - Data jurnal terbaru.
   * @returns {Promise<object>} Jurnal yang diperbarui.
   */
  async update(id, data) {
    return apiRequest(`/api/journals/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },

  /**
   * Menghapus jurnal.
   * @param {number} id - ID jurnal.
   * @returns {Promise<null>} Respons kosong dari API.
   */
  async remove(id) {
    return apiRequest(`/api/journals/${id}/`, { method: "DELETE" });
  }
};
