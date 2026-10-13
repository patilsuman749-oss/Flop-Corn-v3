// Flop Corn service worker
// Minimal cache-first strategy for core shell assets, network-first for everything else.
// This existing purely to satisfy PWA installability requirements (Chrome needs an
// active service worker + manifest to offer "Install app" / "Open in app").

const CACHE_NAME = "flopcorn-shell-v9";

const CORE_ASSETS = [
  "/index.html",
  "/box-office.html",
  "/box-office.css?v=2",
  "/box-office.js?v=2",
  "/style.css?v=5",
  "/favicon.ico",
  "/favicon-192.png",
  "/favicon-512.png",
  "/assets/images/flopcorn-logo.png",
  "/manifest.json",
  "/theme.css?v=1",
  "/theme.js",
  "/logo-responsive.css?v=4"
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
