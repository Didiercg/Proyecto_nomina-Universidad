// Service Worker para Nómina & Finanzas PWA
const CACHE_NAME = 'nomina-finanzas-v3.0';
const STATIC_ASSETS = [
  './',
  './index.html',
  './tailwind.min.css',
  './lucide.min.js',
  './chart.min.js',
  './jszip.min.js',
  './app.js',
  './universidad.js',
  './deudasAmortizacion.js',
  './exportExcel.js',
  './initialData.js',
  './templateBase64.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './favicon.png',
  './icon.svg'
];

// Instalación: Cachear assets estáticos principales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activación: Limpiar caches obsoletos inmediatamente
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Intercepción de peticiones:
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Si no es GET o es hacia Supabase, ir directo a la red sin intervenir
  if (event.request.method !== 'GET' || url.hostname.includes('supabase.co')) {
    return;
  }

  // Para peticiones de mismo origen (archivos locales de la web)
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Servir desde caché y actualizar en segundo plano (Stale-While-Revalidate)
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          }).catch(() => {});
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        }).catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
    );
    return;
  }

  // Para recursos externos opcionales: Network con fallback a cache si existe
  event.respondWith(
    fetch(event.request).catch(async () => {
      return await caches.match(event.request);
    })
  );
});
