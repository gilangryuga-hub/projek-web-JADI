# NetList

NetList adalah aplikasi web untuk menemukan film dan series melalui
data dari [The Movie Database (TMDB)](https://www.themoviedb.org/).
Pengguna dapat menjelajahi katalog, melihat detail tontonan, dan menyimpan
film atau series ke dalam watchlist.

## Fitur yang Sudah Tersedia

### Katalog dan pencarian

- Beranda dengan hero/banner film dan daftar film populer.
- Halaman katalog film.
- Halaman katalog series.
- Pencarian film melalui search bar.
- Filter katalog berdasarkan genre.
- Kartu film/series dengan poster, judul, tahun rilis, dan rating.
- Tampilan responsif untuk desktop dan perangkat mobile.
- Navbar responsif dengan hamburger menu.

### Detail tontonan

- Halaman detail film atau series.
- Sinopsis.
- Rating TMDB.
- Genre.
- Daftar pemeran/karakter.
- Trailer yang dapat diputar melalui YouTube jika tersedia.
- Informasi review dan komentar yang disediakan oleh data TMDB.

### Watchlist

- Menambahkan atau menghapus film dan series dari watchlist.
- Watchlist dipisahkan berdasarkan jenis media: film dan series.
- Status bookmark ditampilkan pada kartu dan halaman detail.
- Halaman khusus untuk melihat isi watchlist.
- Pencarian dari halaman watchlist diteruskan ke katalog film.
- Data watchlist pada frontend disimpan di `localStorage` browser.

### Profil dan backend

- Navbar profil pengguna dengan navigasi khusus.
- Opsi menyembunyikan atau menampilkan navbar profil pada desktop.
- Backend Django dengan database SQLite.
- Model profil pengguna yang terhubung ke akun Django.
- Endpoint REST API untuk registrasi pengguna.
- Endpoint login dan refresh token menggunakan JWT.
- Endpoint untuk mengambil data pengguna yang sedang login.
- Endpoint REST API watchlist dengan pembatasan berdasarkan pengguna.
- Validasi agar item watchlist yang sama tidak ditambahkan dua kali.
- Pengujian API untuk akses anonim, pembuatan, pengambilan, duplikasi,
  dan penghapusan watchlist milik pengguna lain.

> Catatan: API autentikasi dan API watchlist sudah tersedia di backend,
> tetapi frontend saat ini masih menggunakan `localStorage` untuk fitur
> watchlist dan belum menyediakan halaman login/registrasi yang terhubung
> ke API tersebut.

## Fitur yang Direncanakan

- Journaling pengguna.
- Menyimpan film dan series favorit pengguna.
- Daftar film dan series teratas mingguan.
- Integrasi penuh frontend dengan autentikasi JWT dan API watchlist.

## Struktur Proyek

```text
.
|-- frontend/
|   |-- index.html             # Halaman beranda
|   |-- pages/                 # Halaman detail, film, series, watchlist, profil
|   |-- javascript/
|   |   |-- components/        # Komponen kartu dan navbar
|   |   |-- config/            # Konfigurasi API TMDB
|   |   |-- pages/              # Logika setiap halaman
|   |   |-- services/           # Service watchlist
|   |   `-- utils/              # Helper request dan utilitas umum
|   |-- css/                   # Style global, komponen, dan halaman
|   `-- assets/                # Aset statis frontend
`-- backend/
    |-- authentication/        # Registrasi, login JWT, dan profil pengguna
    |-- watchlists/            # Model, serializer, view, dan API watchlist
    |-- journals/              # Modul jurnal, saat ini masih berupa placeholder
    `-- core/                  # Konfigurasi dan routing Django
```

## Endpoint Backend

Semua endpoint berikut menggunakan prefix `/api/`:

| Endpoint | Keterangan |
| --- | --- |
| `POST /api/auth/register/` | Membuat akun baru |
| `POST /api/auth/login/` | Mendapatkan access token dan refresh token |
| `POST /api/auth/token/refresh/` | Memperbarui access token |
| `GET /api/auth/me/` | Mengambil data pengguna yang sedang login |
| `GET /api/watchlist/` | Mengambil watchlist pengguna yang sedang login |
| `POST /api/watchlist/` | Menambahkan item ke watchlist |
| `DELETE /api/watchlist/<id>/` | Menghapus item watchlist |

Endpoint yang membutuhkan autentikasi menggunakan token JWT.

## Menjalankan Backend

Pastikan Python dan dependensi Django REST Framework tersedia, kemudian
jalankan perintah berikut dari folder `backend`:

```bash
python manage.py migrate
python manage.py runserver
```

Frontend dapat dibuka melalui `frontend/index.html`. Data katalog film dan series
diambil dari API TMDB sesuai konfigurasi pada
`frontend/javascript/config/api.js`.
