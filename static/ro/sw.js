/* Bump this version when the application shell changes. */
const CACHE = "bashuk-ro-v1";
const ROOT = new URL("./", self.location).href;
const ASSETS = ["./", "./index.html", "./app.js", "./styles.css", "./dictionary.json", "./manifest.webmanifest", "./icon.svg", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/maskable-512.png", "./icons/apple-touch-icon.png"].map(path => new URL(path, ROOT).href);

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith("bashuk-ro-") && name !== CACHE) await caches.delete(name);
    }
    await self.clients.claim();
    for (const client of await self.clients.matchAll()) client.postMessage({ type: "OFFLINE_READY" });
  })());
});

self.addEventListener("message", event => {
  if (event.data?.type !== "CACHE_STATUS") return;
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const complete = (await Promise.all(ASSETS.map(path => cache.match(path)))).every(Boolean);
    if (complete) event.source?.postMessage({ type: "OFFLINE_READY" });
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || !url.href.startsWith(ROOT)) return;
  const known = ASSETS.includes(url.href);
  if (request.mode !== "navigate" && !known) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (request.mode === "navigate" || url.pathname.endsWith("/dictionary.json")) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.put(request, response.clone());
          return response;
        }
        const saved = await cache.match(request);
        if (saved) return saved;
        return response;
      } catch {
        const saved = await cache.match(request) || (request.mode === "navigate" ? await cache.match(new URL("./index.html", ROOT).href) : null);
        return saved || new Response("Connect once to download the app for offline use.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
      }
    }
    return await cache.match(request) || fetch(request);
  })());
});
