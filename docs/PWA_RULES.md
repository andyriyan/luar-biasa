# PWA RULES

# GOAL

Aplikasi harus:
- installable
- offline-ready
- fast loading
- Android app feel

---

# REQUIRED FILES

## manifest.json

Berisi:
- app name
- theme color
- icons
- splash screen

---

## service-worker.js

Berfungsi:
- cache assets
- offline mode
- preload important files

---

# PERFORMANCE

Optimalkan:
- preload
- lazy loading
- asset compression
- cache strategy

---

# OFFLINE CLASSROOM MODE

Harus compatible dengan:

```bash
python -m http.server 8080
```

atau:

```bash
npx serve
```