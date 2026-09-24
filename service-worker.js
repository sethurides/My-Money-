const CACHE_NAME = 'mymoney-premium-v5'; // Cache refresh version
const ASSETS = [
  'index.html',
  'manifest.json'
];

// 1. Service Worker Install - Caching Core Files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching essential assets');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // Forces the waiting service worker to become the active service worker
});

// 2. Activation - Cleaning Old Caches for Instant Updates
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim(); // Become available to all current clients immediately
});

// 3. Fetching Data - Works Offline Smoothly
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached asset, or perform network request
      return cachedResponse || fetch(event.request).catch(() => {
        // Fallback option in case network fails
        return caches.match('index.html');
      });
    })
  );
});
