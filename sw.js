/* Stelly Run : service worker
   Pour publier une mise à jour du jeu : modifier VERSION ci-dessous. */
const VERSION = 'stelly-run-v5.24';
const FILES = [
  './',
  './index.html',
  './langues.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './icons/favicon-64.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== location.origin) return;   // classement en ligne : jamais mis en cache
  // La page du jeu : réseau d'abord (pour récupérer les mises à jour), cache si hors ligne
  if (req.mode === 'navigate'){
    e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put('./index.html', copy)); return res; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  // Les scripts (textes des langues) : réseau d'abord aussi, pour rester synchronisés avec la page
  if (/\.js$/.test(new URL(req.url).pathname)){
    e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res; })
      .catch(() => caches.match(req, { ignoreSearch: true })));
    return;
  }
  // Le reste (icônes, manifeste) : cache d'abord
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
