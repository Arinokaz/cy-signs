const CACHE_NAME = 'cyprus-signs-dynamic-v1.1';

// При установке кешируем только самую базу: HTML-страницу
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(['index.html']))
  );
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
