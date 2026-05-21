# PROMPT AGRESIF UNTUK PENEMPATAN LINK GAMBAR MANUAL

Gunakan panduan prompt ini HANYA JIKA Anda ingin AI (seperti ChatGPT/Gemini) yang membantu Anda secara aktif menyiapkan *placeholder* (tempat kosong) untuk gambar yang *belum* Anda upload, dan memandu Anda untuk menempelkan link-nya nanti.

Terkadang AI "bandel" dengan mengarang (*halusinasi*) link gambar fiktif atau malah mengabaikan kebutuhan gambar sama sekali. Prompt tambahan ini akan memaksa AI untuk berhenti membuat link palsu dan lebih patuh untuk memberikan Anda "PR" manual yang jelas.

**Salin (Copy) teks di bawah garis putus-putus ini dan tempel (Paste) ke AI (sebagai tambahan setelah Master Prompt) saat Anda meminta pembuatan materi baru:**

--------------------------------------------------------------------------------

**INSTRUKSI WAJIB UNTUK PENANGANAN GAMBAR (BACA DENGAN TELITI):**

Saya ingin materi ini memiliki elemen visual yang kuat. Karena Anda (AI) tidak bisa meng-upload gambar secara langsung ke internet untuk saya, **Anda dilarang keras mengarang (halusinasi) URL gambar fiktif** (seperti menggunakan example.com, path lokal palsu, dsb).

Sebagai gantinya, Anda WAJIB mengikuti prosedur ketat ini:

1. **Analisis Kebutuhan Visual:** Tentukan secara cerdas di bagian mana saja (di dalam "content" suatu konsep) yang SANGAT MEMBUTUHKAN ilustrasi visual (misal: siklus, rumus kompleks, bagan, foto tokoh, diagram).
2. **Siapkan Placeholder (Tanda Tempat):** Di dalam kode `materi.json` yang Anda hasilkan, masukkan tag HTML gambar HANYA dengan format berikut (ingat: gunakan TANDA KUTIP TUNGGAL untuk atribut `src`):
   `<img src='[PASTE_LINK_GAMBAR_UNTUK_..._DISINI]' style='width:100%; border-radius:12px; margin:16px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1);'>`
   *Ganti teks di dalam kurung siku dengan instruksi spesifik tentang gambar apa yang harus saya siapkan. Contoh:* `<img src='[PASTE_LINK_GAMBAR_UNTUK_DIAGRAM_FOTOSINTESIS_DISINI]' ...>`
3. **Berikan To-Do List yang Agresif ke Saya:** Di akhir respons Anda (SETELAH selesai memberikan output JSON), Anda WAJIB membuat satu bagian khusus berjudul "📥 TUGAS UPLOAD GAMBAR MANUAL". Di bagian ini:
   - Daftarkan secara poin-per-poin gambar apa saja yang harus saya cari/buat.
   - Instruksikan saya untuk meng-upload gambar-gambar tersebut ke layanan image hosting seperti **Postimages.org** atau **Imgur.com**.
   - Beritahu saya dengan sangat jelas di ID konsep mana saya harus mencari tulisan `[PASTE_LINK_GAMBAR_UNTUK_..._DISINI]` di dalam file JSON, dan perintahkan saya untuk menimpa/me-replace teks kurung siku tersebut dengan *Direct Link* (.jpg/.png) yang saya dapatkan dari Imgur/Postimages.

Saya ulangi: JANGAN PERNAH mengisi atribut `src=''` dengan link yang Anda buat sendiri. Harus selalu menggunakan placeholder `[PASTE...DISINI]`!
