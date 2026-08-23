// Flop Corn service worker
// Minimal cache-first strategy for core shell assets, network-first for everything else.
// This existing purely to satisfy PWA installability requirements (Chrome needs an
// active service worker + manifest to offer "Install app" / "Open in app").

const CACHE_NAME = "flopcorn-shell-v1";

const CORE_ASSETS = [
  "/index.html",
  "/style.css?v=4",
  "/favicon.ico",
  "/favicon-192.png",
  "/favicon-512.png",
  "/manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Don't let a single failed asset block install
      return Promise.all(
        CORE_ASSETS.map((url) =>
          cache.add(url).catch(() => {
            /* ignore individual asset failures */
          })
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== "GET") return;

  // Don't intercept cross-origin requests (Firebase, TMDB, ad scripts, fonts, etc.)
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);

      // Cache-first for core shell, network-first fallback for the rest
      return cached || network;
    })
  );
});
