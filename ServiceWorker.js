const cacheName = "Team 6515-Word Online Client-0.0.490";
const contentToCache = [
  "Build/bb0d9ecdb05db3e84da20bd14a4f84dc.loader.js",
  "Build/59ec269f88b14d2b698604abbc76c24b.framework.js",
  "Build/661ead34dfd581fac301183e0ab7d529.data",
  "Build/647f629e43962e1c1db793ea4e24afad.wasm",
  "TemplateData/style.css"
];

self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
  e.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    await cache.addAll(contentToCache.map(p => new Request(p, { cache: 'reload' })));
  })());
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  
  if (e.request.url.endsWith("index.html")) {
        e.respondWith(fetch(e.request));
    }
  
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  const isStatic =
    sameOrigin && /\.(js|css|wasm|data|png|jpg|jpeg|gif|webp|svg|ico)$/i.test(url.pathname);

  if (!isStatic) {
    e.respondWith((async () => {
      try {
        return await fetch(req);
      } catch (err) {
        return new Response('', { status: 502, statusText: 'Bad Gateway' });
      }
    })());
    return;
  }

  e.respondWith((async () => {
    const hit = await caches.match(req);
    if (hit) return hit;
    try {
      const resp = await fetch(req);
      if (resp.ok && resp.type !== 'opaque') {
        const cache = await caches.open(cacheName);
        await cache.put(req, resp.clone());
      }
      return resp;
    } catch (err) {
      return new Response('', { status: 504, statusText: 'Gateway Timeout' });
    }
  })());
});
