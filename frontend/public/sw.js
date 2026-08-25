// Minimal service worker — exists mainly to satisfy PWA installability criteria
// (Chrome requires a registered SW with a fetch handler for the install prompt).
// Deliberately does NOT cache API calls or page navigations: this is a frequently
// redeployed, data-driven app, so serving stale HTML/JSON would be worse than
// serving nothing. Only static, content-hashed build assets get runtime-cached.

const RUNTIME_CACHE = 'km-runtime-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== RUNTIME_CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

const isStaticAsset = (url) =>
  url.origin === self.location.origin &&
  (url.pathname.startsWith('/assets/') || /\.(png|jpe?g|svg|webp|ico|woff2?|ttf)$/i.test(url.pathname));

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (!isStaticAsset(url)) return; // let the browser handle everything else normally

  event.respondWith(
    caches.open(RUNTIME_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
