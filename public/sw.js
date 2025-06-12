// Service Worker for background functionality
const CACHE_NAME = 'voiceassist-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
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
  
  // This would integrate with actual WhatsApp Web API when available
  // For now, we'll just log the background activity
  
  return Promise.resolve();
}

// Keep the service worker alive
self.addEventListener('message', function(event) {
  if (event.data.action === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
