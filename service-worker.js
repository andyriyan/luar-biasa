const APP_CACHE = 'edu-app-v10';
const STATIC_ASSETS = [
  './',
  './assets/css/animation.css',
  './assets/css/components.css',
  './assets/css/main.css',
  './assets/css/theme.css',
  './assets/fonts/J7aRnpd8CGxBHpUgtLMA7w.woff2',
  './assets/fonts/J7aRnpd8CGxBHpUrtLMA7w.woff2',
  './assets/fonts/J7aRnpd8CGxBHpUutLM.woff2',
  './assets/fonts/QGYvz_MVcBeNP4NJtEtq.woff2',
  './assets/fonts/QGYvz_MVcBeNP4NJuktqQ4E.woff2',
  './assets/fonts/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2',
  './assets/fonts/fonts.css',
  './assets/fonts/material-icons.css',
  './assets/icons/android-chrome-192x192.png',
  './assets/icons/android-chrome-512x512.png',
  './assets/js/app.js',
  './assets/js/exam-token.js',
  './assets/js/focus-card.js',
  './assets/js/github-sync.js',
  './assets/js/qr-scanner.js',
  './assets/js/quiz.js',
  './assets/js/storage.js',
  './assets/logo/logomts.png',
  './assets/vendor/katex/contrib/auto-render.min.js',
  './assets/vendor/katex/katex.min.css',
  './assets/vendor/katex/katex.min.js',
  './assets/vendor/lucide.min.js',
  './components/bottom-nav.html',
  './components/focus-panel.html',
  './components/footer.html',
  './components/lesson-card.html',
  './components/navbar.html',
  './components/quiz-card.html',
  './data/cloud-config.json',
  './data/materi-list.json',
  './data/navigation.json',
  './data/settings.json',
  './index.html',
  './manifest.json',
  './materi.html',
  './progress.html',
  './quiz.html',
  './settings-identitas.html',
  './settings.html',
  './token-ujian.html'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(APP_CACHE).then(cache =>
      // allSettled: satu file 404 tidak menggagalkan seluruh install
      Promise.allSettled(
        STATIC_ASSETS.map(url =>
          cache.add(url).catch(e => console.warn('[SW] Skip cache:', url, e.message))
        )
      )
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(keys =>
        Promise.all(keys.filter(key => key !== APP_CACHE).map(key => caches.delete(key)))
      )
    ])
  );
});

function isPageOrJson(request) {
  const url = new URL(request.url);
  return request.mode === 'navigate' || url.pathname.endsWith('.json') || url.pathname.endsWith('.html');
}

async function networkFirst(request) {
  const cache = await caches.open(APP_CACHE);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) {
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch {
    return (await cache.match(request)) || (request.mode === 'navigate' ? cache.match('./index.html') : Response.error());
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(APP_CACHE);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then(response => {
      if (response && (response.ok || response.type === 'opaque')) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);
  return cached || (await networkPromise) || Response.error();
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin === self.location.origin && isPageOrJson(event.request)) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(staleWhileRevalidate(event.request));
});
