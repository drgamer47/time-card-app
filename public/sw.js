// Service Worker for Hours Tracker PWA
const CACHE_NAME = 'hours-tracker-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker install error:', error);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip caching for API requests and service worker
  if (
    event.request.url.includes('/rest/v1/') ||
    event.request.url.includes('/auth/v1/') ||
    event.request.url.includes('service-worker') ||
    event.request.url.includes('sw.js') ||
    url.protocol === 'chrome-extension:' ||
    url.protocol === 'moz-extension:' ||
    !url.protocol.startsWith('http')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request).catch((error) => {
          // If fetch fails and it's a document request, return index.html
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
          // For other requests, throw the error
          throw error;
        });
      })
      .catch((error) => {
        // Silently handle errors for non-document requests
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
        // Return a proper error response instead of throwing
        return new Response('Network error', { status: 408 });
      })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Keep service worker alive for timers
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'KEEP_ALIVE') {
    event.ports[0].postMessage({ status: 'alive' });
  }
});

