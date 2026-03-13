// ─── PATAGONIAN APP — SERVICE WORKER ─────────────────────────────────────────
// Cambiá este número cada vez que subas una actualización a GitHub
const VERSION = "2.1.0";
const CACHE_NAME = `patagonian-${VERSION}`;

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
];

// Instalar: cachear todos los assets
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // activar inmediatamente sin esperar
});

// Activar: borrar cachés viejos de versiones anteriores
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith("patagonian-") && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim(); // tomar control de todas las tabs abiertas
});

// Mensaje desde la app para activar el nuevo SW inmediatamente
self.addEventListener("message", (e) => {
  if (e.data?.type === "SKIP_WAITING") self.skipWaiting();
});

// Fetch: cache-first para assets, network-first para todo lo demás
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((response) => {
        // Cachear respuestas válidas
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return response;
      });
    })
  );
});
