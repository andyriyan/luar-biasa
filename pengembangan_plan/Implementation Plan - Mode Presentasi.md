# Implementation Plan - Mode Presentasi Guru & Prompt Antifragile Baru

Membangun fitur **Mode Presentasi** desktop-optimized untuk membantu guru mengajar di depan kelas menggunakan Laptop/Proyektor. Sistem ini dirancang untuk memisahkan materi pembelajaran di smartphone dengan materi presentasi di kelas secara fleksibel, serta didukung oleh prompt AI berorientasi pedagogi tingkat tinggi untuk pembuatan slide secara mandiri.

---

## Proposed Changes

### 1. [MODIFY] [settings-identitas.html](file:///d:/2%20PROJECT/andyriyan_project/media_pembelajaran/settings-identitas.html)
* **Perubahan**: Menambahkan bagian baru di dalam Panel Guru (`#screen-panel`) yang memuat tombol/card navigasi menuju halaman presentasi (`./presentasi.html`).
* **Desain**: Card modern dengan icon `co_present` (Material Icons) dan label "Buka Mode Presentasi Kelas".

### 2. [MODIFY] [index.html](file:///d:/2%20PROJECT/andyriyan_project/media_pembelajaran/index.html) & [materi.html](file:///d:/2%20PROJECT/andyriyan_project/media_pembelajaran/materi.html)
* **Perubahan**: Memperbarui filter rendering daftar materi.
* **Tujuan**: Memastikan materi yang memiliki flag `"presentationOnly": true` di `data/materi-list.json` **tidak akan muncul** di interface smartphone siswa, namun tetap tersimpan dengan aman di database JSON untuk diakses di dashboard guru.

### 3. [NEW] [presentasi.html](file:///d:/2%20PROJECT/andyriyan_project/media_pembelajaran/presentasi.html)
* **Perubahan**: Membuat halaman baru khusus untuk Laptop/Proyektor.
* **Fitur Utama**:
  * **Dashboard Pemilihan**: Menampilkan daftar materi regular + materi khusus presentasi (dengan label badge "Khusus Mengajar").
  * **Slide Viewer Fullscreen**: Antarmuka minimalis, bersih, dan beresolusi tinggi.
  * **Layout Dua Kolom**: 
    * *Kiri*: Penjelasan bertahap, poin besar (Pedagogical Steps), ringkasan konsep, dan rumus KaTeX.
    * *Kanan*: Gambar/ilustrasi besar dan interaktif.
  * **Keyboard Navigation**: Navigasi menggunakan keyboard (Panah Kanan/Space = Lanjut, Panah Kiri = Kembali, Esc = Keluar).
  * **Interactive Jump Menu**: Drawer atau bilah cepat untuk melompat langsung ke konsep/slide tertentu.

### 4. [NEW] [7-PROMPT_PRESENTASI_GURU.md](file:///d:/2%20PROJECT/andyriyan_project/media_pembelajaran/antifragile/7-PROMPT_PRESENTASI_GURU.md)
* **Perubahan**: Menambahkan file prompt instruksional baru di folder `antifragile`.
* **Karakteristik Prompt**:
  * **Pedagogi Kreatif**: Mengubah materi mentah yang berparagraf panjang menjadi penjelasan *step-by-step* terstruktur, dengan poin-poin yang mudah dipahami murid secara instan di layar proyektor kelas.
  * **Presisi Gambar & Media**: Menginstruksikan AI untuk memberikan kata kunci pencarian gambar (ilustrasi/diagram) atau video di internet yang sangat presisi demi menunjang konsep materi tersebut.
  * **Format Kompatibel**: Output berupa kode JSON (`materi.json` dan `quiz.json`) yang siap disalin dan langsung berjalan di sistem ini.

---

## Verification Plan

### Manual Verification
1. Login ke Panel Guru di `settings-identitas.html` (Password default: `123456`).
2. Verifikasi tombol "Mode Presentasi" dapat diklik dan mengarah ke `presentasi.html`.
3. Di `presentasi.html`:
   * Pilih salah satu materi (misal: "Geometri Dasar dan Teorema Pythagoras").
   * Masuk ke Mode Presentasi.
   * Uji navigasi keyboard (Arrow Right/Left, Space, Esc) dan menu lompat slide.
   * Pastikan render KaTeX matematika dan gambar berjalan normal.
4. Di `index.html` dan `materi.html` (Mode Handphone):
   * Tambahkan materi tes dengan `"presentationOnly": true` di `data/materi-list.json`.
   * Pastikan materi tersebut **tidak muncul** pada tampilan Handphone siswa, namun **muncul** di daftar `presentasi.html`.
