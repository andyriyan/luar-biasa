# SCIENTIFIC RENDERING SYSTEM

# GOAL

Mendukung:
- matematika
- fisika
- kimia
- statistik
- logika
- bahasa Arab
- aksara Jawa
- scientific notation

agar nyaman dibaca di smartphone.

---

# MATH SYSTEM

## RECOMMENDED

Gunakan:

## KaTeX

https://katex.org/

Karena:
- sangat cepat
- mobile friendly
- ringan
- cocok untuk smartphone siswa
- rendering cepat

---

## OPTIONAL

Gunakan:

## MathJax

https://www.mathjax.org/

Jika membutuhkan:
- compatibility lebih luas
- formula kompleks
- symbolic rendering lebih lengkap

Namun:
- lebih berat dibanding KaTeX

---

# RECOMMENDATION

## PRIORITAS

- KaTeX untuk production utama
- MathJax untuk formula kompleks

---

# IMPLEMENTATION RULES

## Inline Formula

Gunakan:

```latex
$x^2 + y^2 = z^2$
```

---

## Block Formula

Gunakan:

```latex
$$
\int_a^b f(x)dx
$$
```

---

# SCIENTIFIC CONTENT

## Kategori yang Didukung

- matematika
- fisika
- kimia
- statistik
- ekonomi
- logika formal
- algoritma

---

# CODE HIGHLIGHT

Gunakan:

## Prism.js

https://prismjs.com/

---

# DIAGRAM SUPPORT

Gunakan:

## Mermaid.js

https://mermaid.js.org/

Untuk:
- flowchart
- graph
- diagram algoritma
- mindmap

---

# CHART SUPPORT

Gunakan:

## Chart.js

https://www.chartjs.org/

---

# FONT SYSTEM

# LATIN FONT

## RECOMMENDED

- Inter
- Poppins
- Nunito
- Atkinson Hyperlegible

---

# ARABIC FONT SYSTEM

## PRIORITAS

Gunakan:

## LPMQ Isep Misbah

https://github.com/LajnahPentashihanMushafQuran/LPMQ

Karena:
- nyaman dibaca
- cocok untuk pembelajaran
- mendukung harakat
- familiar di Indonesia

---

## FALLBACK

- Amiri
- Noto Naskh Arabic
- Scheherazade New

---

# ARABIC UI RULES

- gunakan line-height lega
- support RTL
- harakat tidak bertabrakan
- responsive smartphone
- gunakan ukuran huruf lebih besar

---

# JAVANESE FONT SYSTEM

## RECOMMENDED

Gunakan:

## Noto Sans Javanese

https://fonts.google.com/noto/specimen/Noto+Sans+Javanese

Karena:
- support Unicode Jawa modern
- stabil di browser
- ringan

---

## OPTIONAL

- Tuladha Jejeg
- Hanacaraka

---

# MULTISCRIPT RULES

Sistem harus mendukung:
- latin
- arabic
- javanese
- math notation
- scientific notation

secara bersamaan.

---

# FONT LOADING RULES

Gunakan:
- preload font penting
- font-display: swap
- fallback font stack
- subset jika memungkinkan

---

# RECOMMENDED CSS STRUCTURE

```css
:root {
  --font-latin: 'Inter', sans-serif;
  --font-arabic: 'LPMQ Isep Misbah', serif;
  --font-javanese: 'Noto Sans Javanese', sans-serif;
}
```

---

# ACCESSIBILITY

Pastikan:
- readable di layar kecil
- dark mode compatible
- scalable text
- zoom friendly
- contrast baik