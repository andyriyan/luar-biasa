# Media Pembelajaran Digital

Aplikasi media pembelajaran interaktif berbasis web, mobile-first, dan PWA-ready.

## Fitur Utama
- **Mobile First**: UX dirancang khusus untuk smartphone, dengan feel aplikasi Android asli.
- **Learning Focus Card**: Pembelajaran step-by-step menggunakan sistem kartu interaktif.
- **Offline Ready**: Dilengkapi PWA Service Worker untuk akses tanpa internet setelah load pertama.
- **Lightweight**: Menggunakan HTML, TailwindCSS, dan Vanilla JS murni.

## Cara Menjalankan

### Mode Development
Gunakan local server ringan apa saja.
```bash
python -m http.server 8080
# atau
npx serve
```
Buka `http://localhost:8080` di browser.

### Menambahkan Materi Baru
Lihat dokumentasi lengkap di `/docs/` dan template prompt di `MASTER_PROMPT.md`.
Materi disimpan dalam folder `/materi/[nama-materi]/`.
