/**
 * Service autentikasi JWT.
 */
const AuthService = {
  /**
   * Login dan menyimpan access/refresh token.
   * @param {{username: string, password: string}} credentials - Data login.
   * @returns {Promise<object>} Payload token dari API.
   */
  async login(credentials) {
    const response = await apiRequest("/api/auth/login/", {
      method: "POST",
      body: JSON.stringify(credentials)
    });
    saveAuthTokens(response);
    window.dispatchEvent(new CustomEvent("auth:login"));
    return response;
  },

  /**
   * Mendaftarkan akun baru.
   * @param {{username: string, email: string, password: string}} data - Data akun.
   * @returns {Promise<object>} User yang baru dibuat.
   */
  async register(data) {
    return apiRequest("/api/auth/register/", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  /**
   * Menghapus token lokal dan mengembalikan UI ke status Guest.
   * @returns {void}
   */
  logout() {
    clearAuthSession();
  },

  /**
   * Mengambil data user yang sedang login.
   * @returns {Promise<object>} Data user.
   */
  async getMe() {
    return apiRequest("/api/auth/me/");
  },

  /**
   * Memeriksa apakah access atau refresh token tersedia.
   * @returns {boolean} True jika sesi lokal tersedia.
   */
  isAuthenticated() {
    return Boolean(
      localStorage.getItem(API_CONFIG.ACCESS_TOKEN_KEY) ||
      localStorage.getItem(API_CONFIG.REFRESH_TOKEN_KEY)
    );
  }
};
