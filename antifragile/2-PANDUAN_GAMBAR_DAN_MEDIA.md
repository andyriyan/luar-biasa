# PANDUAN MENGGUNAKAN GAMBAR PADA MATERI

Aplikasi Media Pembelajaran ini dirancang berbasis web murni. Oleh karena itu, cara paling mudah, aman, dan efisien untuk memasukkan gambar ke dalam materi Anda tanpa merusak kode adalah menggunakan **Layanan Image Hosting**.

Jika Anda menggunakan AI Web (seperti ChatGPT atau Gemini), AI tersebut tidak bisa menyimpan gambar langsung ke laptop Anda. Inilah cara mengatasinya:

## Langkah-langkah Menambahkan Gambar

1. **Siapkan Gambar Anda**
   Bisa berupa foto, screenshot rumus rumit, bagan, atau grafik yang Anda simpan di HP/Laptop.

2. **Upload Gambar ke Internet**
   Gunakan layanan gratis dan tanpa batas seperti:
   - 👉 [Postimages.org](https://postimages.org/) (Sangat direkomendasikan)
   - 👉 [Imgur.com](https://imgur.com/)
   - 👉 Atau Google Drive (pastikan akses link-nya diatur ke "Anyone with the link").

3. **Dapatkan `Direct Link` (Tautan Langsung)**
   Setelah di-upload (misal di Postimages), pastikan Anda menyalin teks yang bernama **Direct Link** (Tautan Langsung).
   Ciri-cirinya, link tersebut berakhiran file gambar, seperti: `.jpg` atau `.png`.
   *Contoh: `https://i.postimg.cc/abcde123/gambar-fotosintesis.jpg`*

4. **Sampaikan ke AI (ChatGPT/Gemini)**
   Saat Anda meminta AI membuat materi, tambahkan instruksi seperti ini:
   
   > *"Tolong buatkan konsep tentang Fotosintesis. Di bagian awal konsep tersebut, tolong masukkan gambar dengan link ini: `https://i.postimg.cc/abcde123/gambar-fotosintesis.jpg`"*

5. **AI Akan Otomatis Merender-nya!**
   AI yang sudah membaca `1-MASTER_PROMPT_WEB.txt` sudah diprogram untuk merespons gambar Anda menjadi kode aman yang ramah HP (Mobile Friendly Responsive). AI akan menaruhnya di file `materi.json` dalam bentuk seperti ini:
   
   `"<img src='https://i.postimg.cc/abcde123/gambar-fotosintesis.jpg' style='width:100%; border-radius:16px; margin:16px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1);'>"`

   Gambar tersebut akan tampil melengkung elegan di HP siswa dan menyesuaikan ukuran layarnya secara otomatis!

---
**Tips Antifragile:**
Penyimpanan gambar di *Cloud* / Internet (bukan di folder lokal laptop) membuat ukuran aplikasi utama (*source code*) tetap sangat kecil (hanya sekian Kilobyte). Ini membuat performa aplikasi sangat kilat meski diakses dari HP dengan RAM kecil!
