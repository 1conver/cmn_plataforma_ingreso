/* Service worker: red primero y caché como respaldo (uso sin conexión).
   Los MP3 se sirven siempre desde la red: para escuchar sin conexión, descargalos con el botón MP3. */
const CACHE = 'cmn-v3.0.0';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest', 'assets/css/app.css?v=3.0.0', 'assets/img/icon.svg',
  'assets/js/data/temario.js?v=3.0.0', 'assets/js/data/banco.js?v=3.0.0', 'assets/js/data/juegos.js?v=3.0.0',
  'assets/js/data/algoritmos.js?v=3.0.0', 'assets/js/data/podcasts.js?v=3.0.0', 'assets/js/core.js?v=3.0.0',
  'assets/js/pseint.js?v=3.0.0', 'assets/js/ui/home.js?v=3.0.0', 'assets/js/ui/podcast.js?v=3.0.0',
  'assets/js/ui/practice.js?v=3.0.0', 'assets/js/ui/arcade.js?v=3.0.0', 'assets/js/ui/algo.js?v=3.0.0',
  'assets/js/ui/review.js?v=3.0.0', 'assets/js/main.js?v=3.0.0',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // audio: dejar pasar (peticiones por rangos); solo responder desde caché si no hay red
  if (url.pathname.endsWith('.mp3') || req.headers.get('range')) return;
  const sameOrigin = url.origin === self.location.origin;
  const cacheable = sameOrigin || /fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com|i\.ytimg\.com/.test(url.host);
  if (!cacheable) return;
  e.respondWith(fetch(req).then(res => {
    if (res.ok && (res.type === 'basic' || res.type === 'cors')) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
});
