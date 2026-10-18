/**
 * AccessVision Progressive Web App – Service Worker
 *
 * Provides:
 * - App shell caching for instant offline startup
 * - Cache-first strategy for static resources (CSS, JS, icons, fonts)
 * - Network-first for dynamic API routes with offline fallback
 * - Immediate activation upon update
 */

const CACHE_NAME = 'accessvision-pwa-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-192-maskable.png',
  '/icons/icon-512-maskable.png'
];

// Install: Cache critical shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[AccessVision SW] Pre-caching offline app shell');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[AccessVision SW] Failed to cache some static assets during install:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: Purge old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[AccessVision SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Strategy depending on request type
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip chrome-extension, non-http, or POST requests
  if (!url.protocol.startsWith('http') || req.method !== 'GET') {
    return;
  }

  // Navigation requests (HTML pages) -> Network first, fallback to cached index.html
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(req);
          if (cachedResponse) return cachedResponse;
          return cache.match('/index.html') || cache.match('/');
        })
    );
    return;
  }

  // Static assets (JS, CSS, fonts, images) -> Cache first, fallback to network
  if (
    url.pathname.match(/\.(js|css|svg|png|jpg|jpeg|woff2|woff|ttf)$/) ||
    url.origin === self.location.origin
  ) {
    event.respondWith(
      caches.match(req).then((cachedResponse) => {
        if (cachedResponse) {
          // Revalidate in background
          fetch(req)
            .then((fresh) => {
              if (fresh && fresh.status === 200) {
                caches.open(CACHE_NAME).then((cache) => cache.put(req, fresh));
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        return fetch(req)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
            }
            return networkResponse;
          })
          .catch((err) => {
            console.warn('[AccessVision SW] Fetch failed for:', req.url, err);
          });
      })
    );
    return;
  }

  // All other requests -> Network with fallback
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});
