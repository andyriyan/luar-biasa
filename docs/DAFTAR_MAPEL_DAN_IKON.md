# Daftar Kategori, Topik, dan Ikon Material

Aplikasi ini menggunakan **Google Material Icons** (versi font/teks). Untuk menggunakan ikon, Anda hanya perlu menuliskan nama ikonnya saja ke dalam file `materi-list.json`. 

Berikut adalah referensi lengkap untuk pembagian kategori mapel (baik Umum maupun Agama) beserta saran topik spesifik dan nama ikon yang paling cocok.

---

## 1. Matematika (Mathematics)
**Ikon Utama:** `functions` atau `calculate`
* **Aljabar:** `sort` atau `subscript`
* **Geometri (Bangun Datar/Ruang):** `category` atau `architecture`
* **Statistika & Peluang:** `pie_chart`, `bar_chart`, atau `insert_chart`
* **Persamaan Linear / Grafik:** `timeline` atau `show_chart`
* **Aritmatika / Bilangan:** `123` atau `iso`

## 2. Ilmu Pengetahuan Alam (IPA / Science)
**Ikon Utama:** `science`
* **Fisika:** `bolt` (Listrik), `speed` (Kecepatan/Mekanika), `lightbulb` (Energi/Optik)
* **Biologi:** `biotech` (Mikroskopis), `eco` (Tumbuhan/Alam), `psychology` (Anatomi Manusia)
* **Kimia Dasar:** `science` atau `experiment`
* **Tata Surya & Astronomi:** `public` atau `satellite`

## 3. Ilmu Pengetahuan Sosial (IPS / Social Studies)
**Ikon Utama:** `public`
* **Sejarah:** `history` atau `history_edu`
* **Geografi:** `map`, `explore`, atau `terrain`
* **Ekonomi:** `account_balance`, `savings`, atau `trending_up`
* **Sosiologi / Masyarakat:** `groups` atau `people_alt`

## 4. Pendidikan Agama Islam (PAI) & Ke-NU-an
**Ikon Utama:** `mosque`
* **Al-Qur'an Hadis:** `menu_book` atau `auto_stories`
* **Akidah Akhlak:** `favorite`, `volunteer_activism`, atau `self_improvement`
* **Fikih:** `rule`, `gavel`, atau `balance`
* **Sejarah Kebudayaan Islam (SKI):** `history_edu` atau `castle`
* **Ke-NU-an / Aswaja:** `mosque` atau `diversity_3`
* **Bahasa Arab:** `translate` atau `language`

## 5. Bahasa & Sastra (Languages)
**Ikon Utama:** `language`
* **Bahasa Indonesia:** `menu_book` atau `spellcheck`
* **Bahasa Inggris:** `record_voice_over` atau `chat`
* **Menulis / Sastra:** `edit`, `draw`, atau `history_edu`
* **Membaca / Literasi:** `local_library`

## 6. Informatika / TIK
**Ikon Utama:** `computer`
* **Pemrograman / Coding:** `code` atau `terminal`
* **Jaringan:** `router` atau `wifi`
* **Aplikasi / Perangkat Lunak:** `apps` atau `dashboard`
* **Desain Grafis:** `palette` atau `brush`

## 7. Seni Budaya & Prakarya
**Ikon Utama:** `palette`
* **Seni Musik:** `music_note` atau `headphones`
* **Seni Rupa:** `brush` atau `color_lens`
* **Prakarya / Keterampilan:** `handyman` atau `construction`

## 8. Pendidikan Jasmani & Olahraga (PJOK)
**Ikon Utama:** `sports_soccer`
* **Atletik:** `directions_run`
* **Senam / Kebugaran:** `fitness_center`
* **Permainan Bola:** `sports_basketball` atau `sports_volleyball`

---

### Cara Menambahkan Kategori Baru di `materi-list.json`

Jika Anda ingin membuat kategori khusus (misalnya khusus untuk "Fisika"), Anda bisa menambahkannya di `materi-list.json` seperti ini:

```json
"categories": [
  { "id": "all", "label": "Semua", "icon": "grid_view" },
  { "id": "fisika", "label": "Fisika", "icon": "bolt" },
  { "id": "biologi", "label": "Biologi", "icon": "eco" },
  { "id": "quran_hadis", "label": "Qur'an Hadis", "icon": "auto_stories" }
]
```

### Tips Mencari Ikon Lainnya:
Aplikasi Anda sudah terhubung secara bawaan dengan **Google Material Symbols/Icons**. Jika Anda ingin mencari ikon bentuk lain, Anda bisa:
1. Buka situs: [Google Fonts - Material Symbols](https://fonts.google.com/icons)
2. Cari ikon yang Anda inginkan (misalnya ketik "book")
3. Copy **nama ikonnya saja** (biasanya menggunakan huruf kecil dan garis bawah `_`) dan masukkan ke parameter `"icon"` di JSON.
