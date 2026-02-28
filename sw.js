const CACHE_NAME = 'cyprus-signs-dynamic-v5.4';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([
      './',
      'index.html',
      'feedback.html',
      'reference.html',
      'styles.css',
      'translations.js',
      'signs-data.js',
      'js/app.js',
      'js/state.js',
      'js/i18n.js',
      'js/ui.js',
      'js/quiz.js',
      'js/flashcard.js',
      'js/reference-page.js',
      'js/feedback.js',
      'js/feedback-page.js',
      'js/utils.js',
      'js/results.js',
      'manifest.json'
    ]))
  );
});

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
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  const method = event.request.method;

  if (method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }

  if (url.includes('cloudfunctions.net') || url.includes('firebaseio.com') || url.includes('firestore.googleapis.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) return response;

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

