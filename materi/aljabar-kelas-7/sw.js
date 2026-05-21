const CACHE_NAME = 'aljabar-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/materi/konsep-1.html',
  '/materi/konsep-2.html',
  '/materi/latihan.html',
  '/materi/simulasi.html',
  '/materi/quiz.html',
  '/data/soal.json'
];

// Pasang Cache Offline
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

// Ambil data dari cache jika offline
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});