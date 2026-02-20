const CACHE_NAME = 'cyprus-signs-dynamic-v1.4';

// При установке кешируем базовые файлы
self.addEventListener('install', (event) => {
  // Пропускаем ожидание и сразу активируем новую версию
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(['index.html', 'styles.css', 'translations.js', 'signs-data.js', 'app.js', 'manifest.json']))
  );
});

// При активации удаляем старый кеш
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Сообщаем клиентам, что SW готов
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. Если файл уже есть в кеше — отдаем его сразу
      if (cachedResponse) return cachedResponse;

      // 2. Если файла нет — идем в сеть
      return fetch(event.request).then((response) => {
        // Проверяем, что запрос успешный
        if (!response || response.status !== 200) return response;

        // Клонируем ответ, чтобы один отдать браузеру, а второй сохранить в кеш
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );

});

