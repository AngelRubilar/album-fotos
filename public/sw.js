const VERSION = 'v3';
const STATIC_CACHE = `album-fotos-static-${VERSION}`;
const THUMB_CACHE = `album-fotos-thumbs-${VERSION}`;
const THUMB_MAX_ENTRIES = 400; // tope de miniaturas cacheadas (evita crecer sin límite)
const STATIC_ASSETS = ['/', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  const keep = [STATIC_CACHE, THUMB_CACHE];
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => !keep.includes(n)).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Guarda en caché solo respuestas válidas (evita opacas/errores)
function putInCache(cacheName, request, response) {
  if (response && response.ok && response.type === 'basic') {
    const clone = response.clone();
    caches.open(cacheName).then((cache) => cache.put(request, clone));
  }
  return response;
}

// Recorta la caché de miniaturas al tope (cache.keys() respeta orden de inserción)
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  for (const key of keys.slice(0, keys.length - maxEntries)) {
    await cache.delete(key);
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Solo interceptamos GET; mutaciones (upload/delete) van siempre a la red
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Cache-first para miniaturas (inmutables), con tope de tamaño
  if (url.pathname.startsWith('/uploads/thumbnails/') || url.pathname.startsWith('/thumbnails/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((r) => {
          putInCache(THUMB_CACHE, request, r);
          trimCache(THUMB_CACHE, THUMB_MAX_ENTRIES);
          return r;
        });
      })
    );
    return;
  }

  // Navegaciones: network-first con fallback a la app cacheada (offline)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((r) => putInCache(STATIC_CACHE, request, r))
        .catch(() => caches.match(request).then((c) => c || caches.match('/')))
    );
    return;
  }

  // Datos de API (lectura): NETWORK-FIRST para no servir datos obsoletos tras
  // subir/borrar. Solo caemos a caché si no hay red (offline).
  // Excluimos descargas (ZIP) y health.
  if (url.pathname.startsWith('/api/') && !url.pathname.includes('/download') && url.pathname !== '/api/health') {
    event.respondWith(
      fetch(request)
        .then((r) => putInCache(STATIC_CACHE, request, r))
        .catch(() => caches.match(request))
    );
    return;
  }

  // Resto: network-first con fallback a caché
  event.respondWith(
    fetch(request)
      .then((r) => putInCache(STATIC_CACHE, request, r))
      .catch(() => caches.match(request))
  );
});
