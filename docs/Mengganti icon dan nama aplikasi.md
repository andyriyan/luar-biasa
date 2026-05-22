Listed directory antifragile
Listed directory assets
Viewed manifest.json:1-23
Searched for "android-chrome"
Viewed index.html:1-315
Viewed settings-identitas.html:1-564
Viewed app.js:1-177
Viewed service-worker.js:1-245

Berikut adalah jawaban detail dan panduan langkah demi langkah untuk kedua pertanyaan Anda:

---

### 1. Apakah ada yang perlu disesuaikan untuk prompt di folder `antifragile`?

**Jawab: Tidak ada yang perlu disesuaikan.**

**Penjelasan:**
Perbaikan path yang kita lakukan di `quiz.js` bekerja secara **dinamis di sisi runtime (saat aplikasi berjalan di browser)**. 
* Saat file `quiz.json` dibaca oleh browser, JavaScript di `quiz.js` akan menyaring konten kuis dan otomatis menerjemahkan path lokal `images/gambar.png` menjadi path lengkap `materi/[slug]/images/gambar.png`.
* Oleh karena itu, prompt di dalam folder `antifragile` (seperti `1-MASTER_PROMPT_WEB.txt` atau `4-MASTER_PROMPT_WEB_OFFLINE_ASSETS.txt`) dapat tetap dibiarkan apa adanya.
* AI yang membuat materi baru bisa terus menulis path gambar yang simpel seperti `./images/nama-file.png` atau `images/nama-file.png`. Ini justru membuat struktur file JSON materi tetap bersih dan independen.

---

### 2. Cara Mengganti Logo, Icon, dan Nama Aplikasi untuk Install PWA

Mengganti gambar saja **tidak cukup** untuk mengubah seluruh aspek PWA (seperti nama aplikasi saat di-install, warna splash screen, dan pembaruan cache di perangkat pengguna). 

Berikut adalah langkah-langkah yang harus dilakukan untuk kustomisasi penuh:

#### Langkah A: Ganti File Gambar (Logo & Icon PWA)
Anda cukup menimpa (replace) file gambar lama dengan file baru menggunakan nama dan format yang sama persis:
1. **Logo Madrasah**: Ganti file [assets/logo/logomts.png](file:///d:/2%20PROJECT/andyriyan_project/media_pembelajaran/assets/logo/logomts.png).
2. **Icon Aplikasi PWA (saat di-install di HP/PC)**: Ganti file di dalam folder `assets/icons/`:
   * [android-chrome-192x192.png](file:///d:/2%20PROJECT/andyriyan_project/media_pembelajaran/assets/icons/android-chrome-192x192.png) (Pastikan ukurannya tepat **192x192** pixel).
   * [android-chrome-512x512.png](file:///d:/2%20PROJECT/andyriyan_project/media_pembelajaran/assets/icons/android-chrome-512x512.png) (Pastikan ukurannya tepat **512x512** pixel).

*Catatan: Jika nama filenya sama persis, Anda tidak perlu mengubah tag `<img src="...">` di file-file HTML.*

#### Langkah B: Sesuaikan Nama Aplikasi & Tema di `manifest.json`
Agar nama aplikasi yang muncul di layar HP/PC saat di-install berubah sesuai keinginan, Anda **harus mengedit** file [manifest.json](file:///d:/2%20PROJECT/andyriyan_project/media_pembelajaran/manifest.json):

```json
{
  "name": "Nama Madrasah / Media Belajar Baru Anda",
  "short_name": "Nama Singkat",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "background_color": "#FAFAFA",
  "theme_color": "#10853F", 
  "orientation": "portrait",
  "icons": [ ... ]
}
```
* **`name`**: Nama lengkap aplikasi yang muncul di splash screen kuis/aplikasi saat dibuka.
* **`short_name`**: Nama pendek aplikasi yang muncul di bawah icon di layar utama HP/PC setelah di-install.
* **`theme_color`**: Mengubah warna status bar browser / header PWA agar serasi dengan branding logo baru Anda.

#### Langkah C: Update Cache di `service-worker.js` (SANGAT PENTING)
Aplikasi Anda menggunakan **Service Worker** yang bertugas menyimpan gambar logo, icon, dan kode HTML di dalam memori penyimpanan lokal HP/PC pengguna agar aplikasi bisa dibuka secara offline.

Jika Anda mengganti file logo/icon dan nama aplikasi tetapi tidak memperbarui Service Worker, **browser pengguna akan tetap memuat logo/icon lama dari cache**.

Untuk memicu browser mendownload logo, icon, dan nama baru, buka [service-worker.js](file:///d:/2%20PROJECT/andyriyan_project/media_pembelajaran/service-worker.js), lalu **ubah versi cache** pada baris pertama:

```javascript
// Sebelum:
const APP_CACHE = 'edu-app-v2';

// Ubah menjadi (misal v3 atau nama baru lainnya):
const APP_CACHE = 'edu-app-v3';
```

Ketika browser pengguna mendeteksi perubahan string `APP_CACHE` ini:
1. Browser akan mengunduh ulang seluruh aset baru (termasuk logo baru, icon baru, dan `manifest.json` yang baru).
2. Cache lama yang berisi logo lama akan dihapus otomatis.
3. Aplikasi PWA di perangkat pengguna akan diperbarui dengan identitas visual yang baru.