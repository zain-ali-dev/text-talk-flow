
// Service Worker for background functionality
const CACHE_NAME = 'voiceassist-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event
self.addEventListener('install', function(event) {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch(function(error) {
        console.log('Cache failed:', error);
      })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', function(event) {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', function(event) {
  // Skip non-GET requests and chrome-extension requests
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(function(error) {
          console.log('Fetch failed:', error);
          // Return a basic response for failed fetches
          return new Response('Network error occurred', {
            status: 408,
            statusText: 'Request Timeout'
          });
        });
      })
  );
});

// Background sync for WhatsApp monitoring
self.addEventListener('sync', function(event) {
  if (event.tag === 'whatsapp-check') {
    event.waitUntil(checkWhatsAppMessages());
  }
});

function checkWhatsAppMessages() {
  console.log('Background: Checking for WhatsApp messages...');
  return Promise.resolve();
}

// Keep the service worker alive
self.addEventListener('message', function(event) {
  if (event.data && event.data.action === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
