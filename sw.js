// Лесоруб — офлайн-кэш. При обновлении игры поменяйте номер версии.
const CACHE = "lesorub-v5";
const FILES = ["./", "./index.html", "./manifest.json",
  "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png", "./favicon-32.png"];
// при установке берём файлы прямо с сервера, мимо кэша браузера
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f => fetch(new Request(f, { cache: "reload" })).then(r => r.ok && c.put(f, r)).catch(() => {})))));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// сначала сеть (всегда свежая версия с сервера), без интернета — из кэша
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const fresh = new Request(e.request, { cache: "no-cache" });
  e.respondWith(fetch(fresh).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("./index.html"))));
});
