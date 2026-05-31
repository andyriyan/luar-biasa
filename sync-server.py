#!/usr/bin/env python3
"""
sync-server.py
Server lokal untuk Media Pembelajaran Digital.

Menggabungkan dua fungsi dalam satu perintah:
  1. Static file server  — serve seluruh aplikasi di port 8888
  2. Config sync API     — endpoint untuk baca/tulis cloud-config.json
                           agar password & identitas madrasah berlaku
                           di semua HP siswa via jaringan WiFi lokal.

Tidak butuh install apapun — pure Python standard library.

Cara pakai:
  python sync-server.py

Lalu buka di browser:
  http://localhost:8888          (laptop guru)
  http://192.168.x.x:8888        (HP siswa via WiFi yang sama)

Tampilkan IP lokal otomatis saat server start.
"""

import http.server
import socketserver
import json
import os
import sys
import socket
from datetime import datetime
from pathlib import Path

# ─── Konfigurasi ───────────────────────────────────────────────
PORT        = 8888
CONFIG_FILE = Path(__file__).parent / "data" / "cloud-config.json"
API_PREFIX  = "/api/config"

# ─── Helpers ───────────────────────────────────────────────────
def get_local_ip():
    """Cari IP lokal yang bisa diakses perangkat lain di LAN."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


def read_config():
    """Baca cloud-config.json. Return dict kosong jika belum ada."""
    try:
        if CONFIG_FILE.exists():
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception as e:
        print(f"[WARN] Gagal baca config: {e}")
    return {}


def write_config(data: dict):
    """Tulis dict ke cloud-config.json dengan pretty-print."""
    CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# ─── Request Handler ───────────────────────────────────────────
class AppHandler(http.server.SimpleHTTPRequestHandler):

    def log_message(self, fmt, *args):
        # Saring log agar tidak terlalu berisik — hanya tampilkan API calls
        if "/api/" in self.path:
            ts = datetime.now().strftime("%H:%M:%S")
            print(f"  [{ts}] {self.command} {self.path}")

    def send_json(self, code: int, payload: dict):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self._cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def _cors_headers(self):
        """Izinkan akses dari semua origin di jaringan lokal."""
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        """Preflight CORS — dibutuhkan browser sebelum POST."""
        self.send_response(200)
        self._cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path == API_PREFIX or self.path == API_PREFIX + "/":
            # Kembalikan isi cloud-config.json
            config = read_config()
            self.send_json(200, config)
        else:
            # Serve file statis seperti biasa
            super().do_GET()

    def do_POST(self):
        if self.path == API_PREFIX or self.path == API_PREFIX + "/":
            try:
                length  = int(self.headers.get("Content-Length", 0))
                raw     = self.rfile.read(length)
                payload = json.loads(raw.decode("utf-8"))
            except Exception as e:
                self.send_json(400, {"ok": False, "msg": f"Body tidak valid: {e}"})
                return

            # Merge dengan config yang ada (tidak overwrite field yang tidak dikirim)
            current = read_config()
            current.update(payload)
            current["updatedAt"]  = datetime.utcnow().isoformat() + "Z"
            current["updatedBy"]  = "local-server"

            try:
                write_config(current)
                self.send_json(200, {"ok": True, "msg": "Config tersimpan."})
                ts = datetime.now().strftime("%H:%M:%S")
                print(f"  [{ts}] Config diperbarui — passwordHash: {'ada' if current.get('passwordHash') else 'kosong'}")
            except Exception as e:
                self.send_json(500, {"ok": False, "msg": str(e)})
        else:
            self.send_json(404, {"ok": False, "msg": "Endpoint tidak ditemukan."})


# ─── Main ───────────────────────────────────────────────────────
if __name__ == "__main__":
    local_ip = get_local_ip()

    # Pastikan config file ada
    if not CONFIG_FILE.exists():
        write_config({
            "_comment": "Dikelola otomatis oleh sync-server.py",
            "version": "1.0.0",
            "passwordHash": "",
            "appName": "",
            "tagline": "",
            "updatedAt": "",
            "updatedBy": "init"
        })
        print(f"  [INFO] cloud-config.json dibuat di {CONFIG_FILE}")

    # Jalankan server dari direktori yang sama dengan script ini
    os.chdir(Path(__file__).parent)

    print()
    print("  ╔══════════════════════════════════════════════════════╗")
    print("  ║       Media Pembelajaran Digital — Local Server      ║")
    print("  ╠══════════════════════════════════════════════════════╣")
    print(f"  ║  Laptop guru  :  http://localhost:{PORT}               ║")
    print(f"  ║  HP siswa     :  http://{local_ip}:{PORT}         ║")
    print("  ║                                                      ║")
    print("  ║  Pastikan HP siswa terhubung ke WiFi yang sama.      ║")
    print("  ║  Tekan Ctrl+C untuk berhenti.                        ║")
    print("  ╚══════════════════════════════════════════════════════╝")
    print()

    with socketserver.TCPServer(("", PORT), AppHandler) as httpd:
        httpd.allow_reuse_address = True
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n  Server dihentikan. Sampai jumpa!")
            sys.exit(0)
