const APP_CACHE = 'edu-app-v5';
const STATIC_ASSETS = [
  './',
  './assets/css/animation.css',
  './assets/css/components.css',
  './assets/css/main.css',
  './assets/css/theme.css',
  './assets/fonts/2V01KJkDAIA6Hp4zoSScDjV0Y-eoHAHT-Z3MngEefiidxJnkJF5oZA.woff2',
  './assets/fonts/2V01KJkDAIA6Hp4zoSScDjV0Y-eoHAHT-Z3MngEefiidxJnkJFBoZLWj.woff2',
  './assets/fonts/2V01KJkDAIA6Hp4zoSScDjV0Y-eoHAHT-Z3MngEefiidxJnkJHhoZLWj.woff2',
  './assets/fonts/J7aRnpd8CGxBHpUgtLMA7w.woff2',
  './assets/fonts/J7aRnpd8CGxBHpUrtLMA7w.woff2',
  './assets/fonts/J7aRnpd8CGxBHpUutLM.woff2',
  './assets/fonts/QGYvz_MVcBeNP4NJtEtq.woff2',
  './assets/fonts/QGYvz_MVcBeNP4NJuktqQ4E.woff2',
  './assets/fonts/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa0ZL7SUc.woff2',
  './assets/fonts/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2',
  './assets/fonts/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1pL7SUc.woff2',
  './assets/fonts/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa25L7SUc.woff2',
  './assets/fonts/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7SUc.woff2',
  './assets/fonts/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2ZL7SUc.woff2',
  './assets/fonts/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2pL7SUc.woff2',
  './assets/fonts/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2',
  './assets/fonts/fonts.css',
  './assets/fonts/material-icons.css',
  './assets/fonts/pxiByp8kv8JHgFVrLCz7Z11lFc-K.woff2',
  './assets/fonts/pxiByp8kv8JHgFVrLCz7Z1JlFc-K.woff2',
  './assets/fonts/pxiByp8kv8JHgFVrLCz7Z1xlFQ.woff2',
  './assets/fonts/pxiByp8kv8JHgFVrLEj6Z11lFc-K.woff2',
  './assets/fonts/pxiByp8kv8JHgFVrLEj6Z1JlFc-K.woff2',
  './assets/fonts/pxiByp8kv8JHgFVrLEj6Z1xlFQ.woff2',
  './assets/fonts/pxiByp8kv8JHgFVrLGT9Z11lFc-K.woff2',
  './assets/fonts/pxiByp8kv8JHgFVrLGT9Z1JlFc-K.woff2',
  './assets/fonts/pxiByp8kv8JHgFVrLGT9Z1xlFQ.woff2',
  './assets/fonts/syl0-zNym6YjUruM-QrEh7-nyTnjDwKNJ_190FjpZIvDmUSVOK7BDB_Qb9vUSzq3wzLK-P0J-V_Zs-QtQth3-jOcbTCVpeRL2w5rwZu2rIelXxc.woff2',
  './assets/icons/android-chrome-192x192.png',
  './assets/icons/android-chrome-512x512.png',
  './assets/js/app.js',
  './assets/js/exam-token.js',
  './assets/js/focus-card.js',
  './assets/js/quiz.js',
  './assets/js/storage.js',
  './assets/logo/logomts.png',
  './assets/vendor/katex/contrib/auto-render.min.js',
  './assets/vendor/katex/fonts/KaTeX_AMS-Regular.ttf',
  './assets/vendor/katex/fonts/KaTeX_AMS-Regular.woff',
  './assets/vendor/katex/fonts/KaTeX_AMS-Regular.woff2',
  './assets/vendor/katex/fonts/KaTeX_Caligraphic-Bold.ttf',
  './assets/vendor/katex/fonts/KaTeX_Caligraphic-Bold.woff',
  './assets/vendor/katex/fonts/KaTeX_Caligraphic-Bold.woff2',
  './assets/vendor/katex/fonts/KaTeX_Caligraphic-Regular.ttf',
  './assets/vendor/katex/fonts/KaTeX_Caligraphic-Regular.woff',
  './assets/vendor/katex/fonts/KaTeX_Caligraphic-Regular.woff2',
  './assets/vendor/katex/fonts/KaTeX_Fraktur-Bold.ttf',
  './assets/vendor/katex/fonts/KaTeX_Fraktur-Bold.woff',
  './assets/vendor/katex/fonts/KaTeX_Fraktur-Bold.woff2',
  './assets/vendor/katex/fonts/KaTeX_Fraktur-Regular.ttf',
  './assets/vendor/katex/fonts/KaTeX_Fraktur-Regular.woff',
  './assets/vendor/katex/fonts/KaTeX_Fraktur-Regular.woff2',
  './assets/vendor/katex/fonts/KaTeX_Main-Bold.ttf',
  './assets/vendor/katex/fonts/KaTeX_Main-Bold.woff',
  './assets/vendor/katex/fonts/KaTeX_Main-Bold.woff2',
  './assets/vendor/katex/fonts/KaTeX_Main-BoldItalic.ttf',
  './assets/vendor/katex/fonts/KaTeX_Main-BoldItalic.woff',
  './assets/vendor/katex/fonts/KaTeX_Main-BoldItalic.woff2',
  './assets/vendor/katex/fonts/KaTeX_Main-Italic.ttf',
  './assets/vendor/katex/fonts/KaTeX_Main-Italic.woff',
  './assets/vendor/katex/fonts/KaTeX_Main-Italic.woff2',
  './assets/vendor/katex/fonts/KaTeX_Main-Regular.ttf',
  './assets/vendor/katex/fonts/KaTeX_Main-Regular.woff',
  './assets/vendor/katex/fonts/KaTeX_Main-Regular.woff2',
  './assets/vendor/katex/fonts/KaTeX_Math-BoldItalic.ttf',
  './assets/vendor/katex/fonts/KaTeX_Math-BoldItalic.woff',
  './assets/vendor/katex/fonts/KaTeX_Math-BoldItalic.woff2',
  './assets/vendor/katex/fonts/KaTeX_Math-Italic.ttf',
  './assets/vendor/katex/fonts/KaTeX_Math-Italic.woff',
  './assets/vendor/katex/fonts/KaTeX_Math-Italic.woff2',
  './assets/vendor/katex/fonts/KaTeX_SansSerif-Bold.ttf',
  './assets/vendor/katex/fonts/KaTeX_SansSerif-Bold.woff',
  './assets/vendor/katex/fonts/KaTeX_SansSerif-Bold.woff2',
  './assets/vendor/katex/fonts/KaTeX_SansSerif-Italic.ttf',
  './assets/vendor/katex/fonts/KaTeX_SansSerif-Italic.woff',
  './assets/vendor/katex/fonts/KaTeX_SansSerif-Italic.woff2',
  './assets/vendor/katex/fonts/KaTeX_SansSerif-Regular.ttf',
  './assets/vendor/katex/fonts/KaTeX_SansSerif-Regular.woff',
  './assets/vendor/katex/fonts/KaTeX_SansSerif-Regular.woff2',
  './assets/vendor/katex/fonts/KaTeX_Script-Regular.ttf',
  './assets/vendor/katex/fonts/KaTeX_Script-Regular.woff',
  './assets/vendor/katex/fonts/KaTeX_Script-Regular.woff2',
  './assets/vendor/katex/fonts/KaTeX_Size1-Regular.ttf',
  './assets/vendor/katex/fonts/KaTeX_Size1-Regular.woff',
  './assets/vendor/katex/fonts/KaTeX_Size1-Regular.woff2',
  './assets/vendor/katex/fonts/KaTeX_Size2-Regular.ttf',
  './assets/vendor/katex/fonts/KaTeX_Size2-Regular.woff',
  './assets/vendor/katex/fonts/KaTeX_Size2-Regular.woff2',
  './assets/vendor/katex/fonts/KaTeX_Size3-Regular.ttf',
  './assets/vendor/katex/fonts/KaTeX_Size3-Regular.woff',
  './assets/vendor/katex/fonts/KaTeX_Size3-Regular.woff2',
  './assets/vendor/katex/fonts/KaTeX_Size4-Regular.ttf',
  './assets/vendor/katex/fonts/KaTeX_Size4-Regular.woff',
  './assets/vendor/katex/fonts/KaTeX_Size4-Regular.woff2',
  './assets/vendor/katex/fonts/KaTeX_Typewriter-Regular.ttf',
  './assets/vendor/katex/fonts/KaTeX_Typewriter-Regular.woff',
  './assets/vendor/katex/fonts/KaTeX_Typewriter-Regular.woff2',
  './assets/vendor/katex/katex.min.css',
  './assets/vendor/katex/katex.min.js',
  './assets/vendor/lucide.min.js',
  './assets/vendor/tailwind.min.js',
  './components/bottom-nav.html',
  './components/focus-panel.html',
  './components/footer.html',
  './components/lesson-card.html',
  './components/navbar.html',
  './components/quiz-card.html',
  './data/materi-list.json',
  './data/navigation.json',
  './data/settings.json',
  './index.html',
  './manifest.json',
  './materi.html',
  './materi/aljabar/index.html',
  './materi/bangun-datar-segiempat/images/GeometricKite.svg',
  './materi/bangun-datar-segiempat/images/Parallelogram.svg',
  './materi/bangun-datar-segiempat/images/Parallelogram_area.svg',
  './materi/bangun-datar-segiempat/images/Rectangle.svg',
  './materi/bangun-datar-segiempat/images/Rhombus.svg',
  './materi/bangun-datar-segiempat/images/Square_1.svg',
  './materi/bangun-datar-segiempat/images/Trapezoid.svg',
  './materi/bangun-datar-segiempat/index.html',
  './materi/bangun-datar-segiempat/materi.json',
  './materi/bangun-datar-segiempat/quiz.json',
  './materi/bank-soal-matematika-smp/index.html',
  './materi/bank-soal-matematika-smp/materi.json',
  './materi/bank-soal-matematika-smp/quiz.json',
  './materi/bilangan-bulat/index.html',
  './materi/bilangan-bulat/materi.json',
  './materi/bilangan-bulat/quiz.json',
  './materi/bilbul/index.html',
  './materi/geometri-dan-pythagoras/images/3iW8A7t.png',
  './materi/geometri-dan-pythagoras/images/K0thyPQ.png',
  './materi/geometri-dan-pythagoras/images/NWCDKKa.png',
  './materi/geometri-dan-pythagoras/images/NyOsAgb.png',
  './materi/geometri-dan-pythagoras/images/XtO4eIQ.png',
  './materi/geometri-dan-pythagoras/images/hOPDFlM.png',
  './materi/geometri-dan-pythagoras/images/nIt9QlL.png',
  './materi/geometri-dan-pythagoras/images/zaXvdBm.png',
  './materi/geometri-dan-pythagoras/index.html',
  './materi/geometri-dan-pythagoras/materi.json',
  './materi/geometri-dan-pythagoras/quiz.json',
  './materi/geometri-lengkap/images/151ShFYd_screenshot-1.png',
  './materi/geometri-lengkap/images/2SHg6L2r_screenshot-1.png',
  './materi/geometri-lengkap/images/Bt9wrxSs_Screenshot-2026-05-10-100320.png',
  './materi/geometri-lengkap/images/fWxFdrBH_screenshot-1.png',
  './materi/geometri-lengkap/images/nhwwZbhh_screenshot-1.png',
  './materi/geometri-lengkap/images/pdLxctc3_screenshot-1.png',
  './materi/geometri-lengkap/images/tJWHnR77_screenshot-1.png',
  './materi/geometri-lengkap/images/xT2wF2cm_screenshot-1.png',
  './materi/geometri-lengkap/index.html',
  './materi/geometri-lengkap/materi.json',
  './materi/geometri-lengkap/quiz.json',
  './materi/pas-geometri-2024/images/3i7Betw.png',
  './materi/pas-geometri-2024/images/HsHTx1y.png',
  './materi/pas-geometri-2024/images/PkFJgMh.png',
  './materi/pas-geometri-2024/images/RZLL7tT.png',
  './materi/pas-geometri-2024/images/TUDAXa0.png',
  './materi/pas-geometri-2024/images/oZst4Kg.png',
  './materi/pas-geometri-2024/images/sdCcQIK.png',
  './materi/pas-geometri-2024/images/xPQMqqz.png',
  './materi/pas-geometri-2024/index.html',
  './materi/pas-geometri-2024/materi.json',
  './materi/pas-geometri-2024/quiz.json',
  './materi/pengantar-aswaja/index.html',
  './materi/pengantar-aswaja/materi.json',
  './materi/pengantar-aswaja/quiz.json',
  './materi/statistika-smp/index.html',
  './materi/statistika-smp/materi.json',
  './materi/statistika-smp/quiz.json',
  './materi/tekanan-ipa-kelas-9/index.html',
  './materi/tekanan-ipa-kelas-9/materi.json',
  './materi/tekanan-ipa-kelas-9/quiz.json',
  './progress.html',
  './quiz.html',
  './settings-identitas.html',
  './settings.html',
  './token-ujian.html',
  './materi/ulangan-aljabar-7/index.html',
  './materi/ulangan-bilangan-bulat-7/index.html'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(APP_CACHE).then(cache => cache.addAll(STATIC_ASSETS)));
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
