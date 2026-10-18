// FLOP CORN service worker: fresh app shell + offline fallback.
// HTML and code use network-first so deployed fixes reach users; images and other
// static assets use cache-first for quicker repeat visits.
const CACHE_NAME = "flopcorn-shell-v11";
const CORE_ASSETS = [
  "/index.html",
  "/movie.html",
  "/explore.html",
  "/category.html",
  "/box-office.html",
  "/style.css?v=6",
  "/performance-mobile-polish.css?v=1",
  "/home-mobile-fixes.css?v=1",
  "/favicon.ico",
  "/favicon-192.png",
  "/favicon-512.png",
  "/assets/images/flopcorn-logo.png",
  "/manifest.json",
  "/theme.css?v=1",
  "/theme.js",
  "/logo-responsive.css?v=4",
  "/home-ai-widget.css?v=2",
  "/home-ai-widget.js?v=2"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(CORE_ASSETS.map(async (url) => {
      try { await cache.add(url); } catch (_) { /* optional shell asset */ }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith("flopcorn-shell-") && key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isPageOrCode = request.mode === "navigate" || /\.(?:html?|css|js|mjs)(?:$|\?)/i.test(url.pathname + url.search);
  if (isPageOrCode) {
    // Network-first ensures HTML/CSS/JS updates are not hidden behind stale cache.
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(request);
        if (response && response.ok) cache.put(request, response.clone()).catch(() => {});
        return response;
      } catch (_) {
        return (await cache.match(request)) || (request.mode === "navigate" ? await cache.match("/index.html") : Response.error());
      }
    })());
    return;
  }

  // Cache-first for same-origin static assets; update cache when online.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    const networkPromise = fetch(request).then((response) => {
      if (response && response.ok) cache.put(request, response.clone()).catch(() => {});
      return response;
    }).catch(() => cached);
    return cached || await networkPromise;
  })());
});
