# 🟢 NU Premium "Aswaja" Design Kit

Ini adalah panduan gaya (Style Guide) dan **Master Design Prompt** yang menggabungkan seluruh elemen visual premium dari aplikasi PPDB Madrasah Anda. Gunakan prompt di bawah ini untuk menduplikasi estetika ini pada aplikasi lain lewat AI (seperti ChatGPT, Claude, atau Gemini).

---

## 🎨 Master Design Prompt for AI

Salin teks di bawah ini ke AI pilihan Anda:

> "Buatkan UI desain dengan tema **NU Premium Excellence**. Gunakan palet warna **Deep Green (#14532d)** sebagai warna primer dan **Gold (#ca8a04)** sebagai aksen mewah. Latar belakang utama harus tetap **Pure White** dengan elemen **Glassmorphism** (transparansi 90%, blur 20px) pada kartu dan navigasi.
> 
> **Spesifikasi Detail Konten:**
> 
> 1. **Typography:** Gunakan font modern **'Outfit'** atau **'Inter'**. Judul harus tebal (Extra Bold) untuk kesan berwibawa.
> 2. **Kartu & Radius:** Gunakan sudut sangat melengkung (**border-radius: 24px - 32px**) dan bayangan lembut (**shadow-premium**) yang mengarah ke warna hijau gelap.
> 3. **Elemen Tabel & Jadwal:** Tabel harus bersih dengan header abu-abu muda (**#f1f5f9**). Gunakan **'Date Badges'** berwarna Hijau Muda Mint (**#f0fdf4**) dengan teks Hijau Tua (**#166534**) untuk penanda waktu. Setiap kartu utama harus memiliki garis penutup (border-bottom) berwarna **Emas** setebal 4px.
> 4. **Dark Mode Otomatis:** Sistem harus otomatis beralih ke tema **Midnight Blue (#0f172a)** dengan aksen **Emerald Green**. Pada mode gelap, badge waktu berubah menjadi semi-transparan dengan teks neon green (#86efac).
> 5. **Ikon:** Gunakan ikon gaya minimalis dari FontAwesome berwarna Emas untuk navigasi utama."

---

## 📐 Spesifikasi Teknis (Tokens)

Jika Anda membangun aplikasi sendiri, gunakan variabel CSS berikut:

### 1. Warna Utama (Base Palette)

- **Primary:** `#14532d` (Warna identitas NU)
- **Accent:** `#ca8a04` (Gold Premium)
- **Background:** `#ffffff` (Putih Bersih)
- **Secondary Bg:** `#f1f5f9` (Light Slate untuk Header Tabel)

### 2. Komponen Jadwal & Tabel

- **Badge Background:** `#f0fdf4` (Soft Mint)
- **Badge Text:** `#166534` (Deep Emerald)
- **Table Header Text:** `#14532d` (Primary)

### 3. Dark Mode Transitions

- **Dark BG:** `#0f172a` (Midnight)
- **Dark Card:** `#1e293b` (Deep Slate)
- **Dark Badge:** `rgba(22, 101, 52, 0.2)`
- **Dark Badge Text:** `#86efac` (Neon Mint)

---

## 💡 Tips Penggunaan

- **Keseimbangan Warna:** Gunakan Hijau Tua hanya untuk 20% elemen (Header, Tombol Utama, Ikon). Biarkan 80% sisanya berwarna putih/terang untuk menjaga navigasi tetap "Native Android" dan modern.
- **Aksen Emas:** Gunakan warna Emas hanya untuk detail kecil seperti ikon pelengkap, garis bawah kartu, atau status penting agar tidak terlihat norak.
- **Interaksi:** Berikan efek `hover` atau `press` yang sedikit memperkecil ukuran elemen atau menambah bayangan untuk kesan premium.