/* Service Worker: Netzwerk zuerst (immer aktuelle Seite), Zwischenspeicher nur als Notnagel.
   Daten aus Supabase werden bewusst NICHT zwischengespeichert. */
const CACHE = 'obert-v6';
const SHELL = ['./', 'index.html', 'styles.css', 'config.js', 'core.js', 'views-client.js', 'views-trainer.js', 'bild-suche.js', 'manifest.webmanifest', 'icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {}))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(r).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); return res; }).catch(() => caches.match(r).then(m => m || caches.match('index.html'))));
});
