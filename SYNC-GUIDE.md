# Panduan Sinkronisasi Lintas Perangkat

Dokumen ini menjelaskan cara kerja sinkronisasi password dan identitas
madrasah di dua skenario deployment yang didukung aplikasi ini.

---

## Dua Skenario yang Didukung

### Skenario A — GitHub Pages (akses via internet)

Cocok untuk: karya publik, akses dari mana saja, demo ke orang lain.

```
Guru / Siswa (HP/laptop)  →  internet  →  GitHub Pages
                                           data/cloud-config.json
```

Password dan identitas madrasah disimpan sebagai hash di `data/cloud-config.json`
di dalam repo GitHub. Semua perangkat di seluruh dunia yang mengakses aplikasi
ini akan menggunakan password yang sama.

**Setup (sekali saja):**
1. Buka https://github.com/settings/tokens/new
2. Beri nama: `MediaPembelajaran`, centang scope: `repo`
3. Klik Generate — salin token (hanya tampil sekali!)
4. Di aplikasi → Panel Guru → Sinkronisasi Lintas Perangkat
5. Isi: Nama Repo (`username/nama-repo`), Branch (`main`), PAT (token tadi)
6. Klik **Test Koneksi** → **Hubungkan GitHub**

Setelah terhubung, setiap perubahan password atau identitas madrasah
langsung tersinkronkan ke repo dan berlaku di semua perangkat.

---

### Skenario B — Local Server (kelas tanpa internet)

Cocok untuk: mengajar di kelas, koneksi internet tidak stabil/tidak ada,
HP siswa terhubung ke WiFi laptop/hotspot guru.

```
HP Siswa (browser)  →  WiFi lokal  →  Laptop Guru (sync-server.py)
                                       data/cloud-config.json
```

`sync-server.py` menggabungkan dua fungsi:
- Static file server (menggantikan `py -m http.server`)
- Config sync API (`GET/POST /api/config`)

**Setup:**

1. Pastikan Python 3 terinstal (cek: `python --version`)
2. Buka terminal di folder aplikasi ini
3. Jalankan:

```bash
python sync-server.py
```

4. Terminal akan menampilkan:

```
  ╔══════════════════════════════════════════════════════╗
  ║       Media Pembelajaran Digital — Local Server      ║
  ╠══════════════════════════════════════════════════════╣
  ║  Laptop guru  :  http://localhost:8888               ║
  ║  HP siswa     :  http://192.168.1.5:8888             ║
  ╚══════════════════════════════════════════════════════╝
```

5. Bagikan URL `http://192.168.x.x:8888` ke siswa (tulis di papan tulis)
6. Siswa buka URL tersebut di browser HP masing-masing

**Catatan penting:**
- Laptop guru dan HP siswa harus terhubung ke WiFi yang sama
- Bisa juga pakai hotspot dari HP guru (aktifkan hotspot → jalankan server)
- Tidak butuh internet sama sekali
- Password yang diubah via Panel Guru langsung berlaku di semua HP siswa

---

## Deteksi Otomatis

Aplikasi mendeteksi mode yang tepat secara otomatis berdasarkan URL:

| URL diakses via | Mode aktif | Sumber password |
|---|---|---|
| `localhost:8888` | Local Server | `sync-server.py` di komputer ini |
| `192.168.x.x:8888` | Local Server | `sync-server.py` di komputer server |
| `username.github.io/...` | GitHub | `data/cloud-config.json` di repo |
| Offline / tidak ada sync | Fallback | `localStorage` → default `123456` |

Di layar login Panel Guru, ada **badge** yang menampilkan sumber password
yang aktif saat ini sehingga guru bisa langsung tahu.

---

## Keamanan

- Password asli **tidak pernah disimpan** — hanya hash SHA-256-nya
- PAT GitHub hanya tersimpan di `localStorage` perangkat guru, tidak dikirim ke server lain
- `sync-server.py` hanya bisa diakses dari jaringan lokal (tidak terekspos internet)
- File `cloud-config.json` di repo bersifat publik (bisa dibaca siapa saja),
  tapi yang tersimpan hanya hash — tidak bisa dikembalikan ke password asli

---

## Workflow Guru Sehari-hari

```
Di rumah / kantor:
  git pull → (edit materi jika perlu) → git push
  → aplikasi otomatis terupdate di GitHub Pages

Di kelas:
  git pull  (opsional, ambil update terbaru)
  python sync-server.py
  → bagikan IP ke siswa
  → mulai mengajar
```

---

## Troubleshooting

**Badge login menampilkan "sync-server.py belum jalan?"**
→ Jalankan `python sync-server.py` di terminal terlebih dahulu.

**HP siswa tidak bisa akses IP guru**
→ Pastikan keduanya terhubung WiFi yang sama.
→ Coba matikan Windows Firewall sementara, atau izinkan Python di firewall.

**Password baru tidak berlaku setelah ganti di Panel Guru**
→ Di GitHub Pages: tunggu beberapa detik (GitHub CDN cache), lalu coba lagi.
→ Di local server: harusnya langsung berlaku. Cek apakah server masih jalan.

**Lupa password, tidak bisa masuk Panel Guru**
→ Jalankan di terminal:
```bash
python -c "
import json, hashlib
h = hashlib.sha256('123456'.encode()).hexdigest()
with open('data/cloud-config.json','r+') as f:
    d = json.load(f)
    d['passwordHash'] = h
    f.seek(0); json.dump(d, f, indent=2); f.truncate()
print('Password direset ke: 123456')
"
```
