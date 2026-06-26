'use strict';

const CACHE_VERSION = 'CACHE_V1';
const OFFLINE_URL = '/offline.html';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/offline.html',
  '/manifest.json',
  '/images/hero.jpg',
  '/images/sunset.jpg',
  '/images/altun-ha.jpg',
  '/images/lamanai.jpg',
  '/images/snorkeling.jpg',
  '/images/cave.jpg',
  '/images/jungle.jpg',
  '/images/city.jpg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-512.png',
  '/assets/lightbox.css',
  '/assets/lightbox.js',
  '/assets/images/close.png',
  '/assets/images/loading.gif',
  '/assets/images/next.png',
  '/assets/images/prev.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_VERSION)
            .map(key => caches.delete(key))
        )
      )
      .then(() => {
        self.clients.claim();
        notifyClients({ type: 'SW_UPDATED' });
      })
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== location.origin) return;

  const destination = request.destination;

  if (destination === 'document') {
    event.respondWith(networkFirst(request));
    return;
  }

  if (destination === 'style' || destination === 'script') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  if (
    destination === 'image' ||
    destination === 'font' ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/assets/images/')
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.destination === 'document') {
      return caches.match(OFFLINE_URL);
    }
    return new Response('Network error', { status: 408 });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then(networkResponse => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((err) => null);

  return cached || await fetchPromise || new Response('Offline', { status: 503 });
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    return new Response('Asset unavailable offline', { status: 503 });
  }
}

function notifyClients(payload) {
  self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
    .then(clients => clients.forEach(client => client.postMessage(payload)));
}

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
