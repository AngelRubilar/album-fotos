const VERSION = 'v2';
const CACHE_NAME = `album-fotos-${VERSION}`;
const STATIC_ASSETS = ['/', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Guarda en caché solo respuestas válidas (evita opacas/errores)
function putInCache(request, response) {
  if (response && response.ok && response.type === 'basic') {
    const clone = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Solo interceptamos GET; mutaciones (upload/delete) van siempre a la red
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Cache-first para miniaturas (inmutables)
  if (url.pathname.startsWith('/uploads/thumbnails/') || url.pathname.startsWith('/thumbnails/')) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((r) => putInCache(request, r)))
    );
    return;
  }

  // Navegaciones: network-first con fallback a la app cacheada (offline)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((r) => putInCache(request, r))
        .catch(() => caches.match(request).then((c) => c || caches.match('/')))
    );
    return;
  }

  // Datos de API (lectura): stale-while-revalidate. Excluimos descargas (ZIP) y health.
  if (url.pathname.startsWith('/api/') && !url.pathname.includes('/download') && url.pathname !== '/api/health') {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((r) => putInCache(request, r))
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Resto: network-first con fallback a caché
  event.respondWith(
    fetch(request)
      .then((r) => putInCache(request, r))
      .catch(() => caches.match(request))
  );
});
