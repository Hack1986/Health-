const CACHE_NAME = 'my-health-record-v8-1-github-offline';
const BASE = 'https://hack1986.github.io/My-health-/';
const CORE_ASSETS = [
  './', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png'
].map(path => new URL(path, BASE).toString());

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE_ASSETS);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE_NAME && key.startsWith('my-health-record-')).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

// Offline-first: only same-origin app files are served from this app's cache.
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (!url.href.startsWith(BASE)) return;
  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') {
      const indexUrl = new URL('./index.html', BASE).toString();
      return (await caches.match(indexUrl)) || Response.error();
    }
    return Response.error();
  })());
});
