// PeMA service worker: caches the app so it opens and runs offline.
// It never caches /api/ requests, so no check-in text or session content is stored here.
// The build stamps CACHE_VERSION (see vite.config.ts), so each release installs a new worker.
const CACHE_VERSION = 'pema-v1';
const SHELL = ['/', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png', '/icons/favicon-32.png',
  // Mental SPA narration, so the voice works offline
  '/audio/spa-1.mp3', '/audio/spa-2.mp3', '/audio/spa-3.mp3', '/audio/spa-4.mp3', '/audio/spa-5.mp3'];

// Read the built index.html and precache every hashed /assets/ file it references
async function precacheShell() {
  const cache = await caches.open(CACHE_VERSION);
  const res = await fetch('/', { cache: 'no-store' });
  const html = await res.clone().text();
  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map(m => m[1]);
  // Code loaded later (such as the Claude session code) is named inside the main scripts
  for (let i = 0; i < assets.length; i++) {
    if (!assets[i].endsWith('.js')) continue;
    const js = await (await fetch(assets[i])).text();
    for (const m of js.matchAll(/["'`](?:\.\/|\/?assets\/)([\w.-]+\.js)["'`]/g)) {
      const url = `/assets/${m[1]}`;
      if (!assets.includes(url)) assets.push(url);
    }
  }
  await cache.put('/', res);
  await cache.addAll([...new Set([...SHELL.filter(u => u !== '/'), ...assets])]);
}

self.addEventListener('install', event => {
  event.waitUntil(precacheShell());
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// The page asks the waiting worker to take over when the user taps "update"
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.pathname.startsWith('/api/')) return;

  // Pages: network first so updates arrive, cached app shell when offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(res => {
          if (res.ok && url.pathname === '/') {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then(cache => cache.put('/', copy));
          }
          return res;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  // Same-origin files: cache first, then network (and keep a copy)
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(res => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then(cache => cache.put(request, copy));
      }
      return res;
    }))
  );
});
