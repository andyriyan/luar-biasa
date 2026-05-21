# SOURCE MATERIAL INGEST PROMPT

Gunakan prompt ini saat Anda ingin AI mengubah materi mentah menjadi modul pembelajaran interaktif yang utuh di dalam aplikasi ini.

---
**Copy Teks di Bawah Ini ke AI (Claude/Gemini/ChatGPT):**
---

Ada source material baru pada project ini.

Lokasi:
[GANTI DENGAN LOKASI FILE ATAU PASTE MATERI DI SINI]

Tugas:
1. baca dan pahami isi materi
2. pecah materi menjadi konsep-konsep kecil
3. buat progressive learning flow
4. buat Learning Focus Card structure
5. buat step-by-step learning
6. buat mobile-first presentation
7. buat quiz.json
8. buat materi.json
9. buat halaman materi
10. update homepage
11. update navigation
12. update materi-list.json

Gunakan aturan dari:
- MASTER_PROMPT.md
- UX_RULES.md
- DESIGN_SYSTEM.md (termasuk palet NU Premium)
- AI_RULES.md
- MATERIAL_SYSTEM.md
- SCIENTIFIC_RENDERING.md

Kebutuhan:
- Android-native feel
- immersive learning
- one focus at a time
- responsive smartphone UI
- smooth animation
- scientific rendering support
- dark mode support
- reusable component
- semantic HTML
- modular JavaScript

Pastikan:
- tidak merusak struktur existing
- tidak overwrite materi lain
- menjaga consistency UI
- menjaga consistency architecture

Tambahan WAJIB untuk mode offline:
- setiap materi baru harus memiliki folder:
  - `materi/[slug]/images/`
  - `materi/[slug]/assets/`
- semua gambar di konten harus dari path lokal relatif (bukan URL hosting eksternal)
- jika gambar belum ada, keluarkan daftar nama file + deskripsi gambar + alt text agar bisa disiapkan
