// ============================================================
//  Epic Mayan Tours — Service Worker
//  Strategy:
//    HTML          → Network First  (always fresh content)
//    CSS / JS      → Stale While Revalidate
//    Images/Icons  → Cache First    (long-lived assets)
//  Auto-update:    skipWaiting + postMessage on new version
// ============================================================

const CACHE_VERSION = 'CACHE_V1';
const OFFLINE_URL   = '/offline.html';

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
  // Lightbox2 assets (served locally via /assets/)
  '/assets/lightbox.css',
  '/assets/lightbox.js'
  '/assets/images/close.png',
  '/assets/images/loading.gif',
  '/assets/images/next.png',
  '/assets/images/prev.png'
];

// ─── INSTALL ────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())   // activate immediately
  );
});

// ─── ACTIVATE ───────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_VERSION)
            .map(key => caches.delete(key))   // remove old caches
        )
      )
      .then(() => {
        self.clients.claim();                 // take control immediately
        notifyClients({ type: 'SW_UPDATED' });
      })
  );
});

// ─── FETCH ──────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (request.method !== 'GET' || url.origin !== location.origin) return;

  const destination = request.destination;

  // ── HTML → Network First ──────────────────────────────────
  if (destination === 'document') {
    event.respondWith(networkFirst(request));
    return;
  }

  // ── CSS / JS → Stale While Revalidate ────────────────────
  if (destination === 'style' || destination === 'script') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // ── Images / Icons / Fonts → Cache First ─────────────────
  if (
    destination === 'image' ||
    destination === 'font'  ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/images/')
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // ── Everything else → Network with cache fallback ─────────
  event.respondWith(networkFirst(request));
});

// ─── STRATEGIES ─────────────────────────────────────────────

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err){
    const cached = await caches.match(request);
    if (cached) return cached;
    // For navigation failures, return offline page
    if (request.destination === 'document') {
      return caches.match(OFFLINE_URL);
    }
    return new Response('Network error', { status: 408 });
  }
}

async function staleWhileRevalidate(request) {
  const cache  = await caches.open(CACHE_VERSION);
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
  } catch (err){
    return new Response('Asset unavailable offline', { status: 503 });
  }
}

// ─── AUTO-UPDATE NOTIFICATION ────────────────────────────────
function notifyClients(payload) {
  self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
    .then(clients => clients.forEach(client => client.postMessage(payload)));
}

// ─── MANUAL SKIP WAITING (triggered from app.js) ─────────────
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
