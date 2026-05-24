# Rencana Penyelesaian Fitur Mode Presentasi Guru & Filter Mode Mengajar

Membangun sisa tugas dari Rencana Pengembangan Mode Presentasi Guru untuk mengoptimalkan visualisasi pembelajaran di proyektor kelas, menyembunyikan materi bertanda khusus dari siswa, dan memfasilitasi pembuatan materi presentasi yang interaktif.

## User Review Required

> [!NOTE]
> Kami akan menyelaraskan visualisasi dan filter "presentationOnly" di seluruh antarmuka siswa (HP) termasuk halaman beranda (`index.html`), daftar materi (`materi.html`), dan kalkulasi progress belajar (`progress.html`).

## Proposed Changes

---

### Core Student Interface Filters

#### [MODIFY] [index.html](file:///d:/2%20PROJECT/andyriyan_project/media_pembelajaran/index.html)
- **Tujuan**: Memastikan perhitungan statistik `total` dan `done` tidak mengikutkan materi berlabel `presentationOnly: true`.
- **Perubahan**:
  - Filter `data.materi` pada bagian kalkulasi total dan done untuk mengabaikan `presentationOnly: true`.

#### [MODIFY] [progress.html](file:///d:/2%20PROJECT/andyriyan_project/media_pembelajaran/progress.html)
- **Tujuan**: Menyembunyikan materi `presentationOnly: true` dari layar progress siswa, serta menyesuaikan perhitungan stat total, selesai, sedang dikerjakan, dan persentase keseluruhan.
- **Perubahan**:
  - Filter `data.materi` di `progress.html` agar tidak menampilkan materi dengan `presentationOnly: true`.

---

### Teacher Tools & Prompt

#### [NEW] [7-PROMPT_PRESENTASI_GURU.md](file:///d:/2%20PROJECT/andyriyan_project/media_pembelajaran/antifragile/7-PROMPT_PRESENTASI_GURU.md)
- **Tujuan**: Menyediakan Master Prompt untuk guru agar AI dapat membuat slide presentasi proyektor yang interaktif, visual, pedagogis, dan terbebas dari teks padat yang membosankan (Anti-Jenuh).
- **Karakteristik**:
  - Batasan ketat penjelasan maksimal 25 kata per konsep.
  - Langkah-langkah penjelasan visual bertahap (Incremental Step-by-Step).
  - Kata kunci media/gambar yang spesifik untuk diintegrasikan pada kolom kanan slide `presentasi.html`.
  - Format output JSON (`materi.json` dan `quiz.json`) yang kompatibel sepenuhnya dengan mesin slideshow dinamis kita.

---

## Verification Plan

### Manual Verification
1. Tambahkan materi uji coba dengan `"presentationOnly": true` di `data/materi-list.json`.
2. Buka `index.html` dan `materi.html`:
   - Pastikan materi uji coba tersebut **tidak muncul** pada tampilan siswa.
   - Pastikan statistik total materi pada beranda menghitung dengan benar (tanpa materi presentationOnly).
3. Buka `progress.html`:
   - Pastikan materi uji coba **tidak muncul** di daftar detail progress siswa.
   - Pastikan perhitungan total, selesai, dan sedang dikerjakan terhitung dengan benar tanpa materi presentationOnly.
4. Login ke Panel Guru di `settings-identitas.html` (Password: `123456`).
   - Pastikan tombol "Mulai Presentasi Mengajar" mengarah ke `presentasi.html`.
5. Di `presentasi.html`:
   - Pastikan materi uji coba bertanda `"presentationOnly": true` **muncul** dengan badge emas "Khusus Mengajar".
   - Jalankan slideshow untuk materi tersebut, tes navigasi keyboard (kanan, kiri, spasi, Esc), full screen, render KaTeX, serta pengungkapan step-by-step secara inkremental.
