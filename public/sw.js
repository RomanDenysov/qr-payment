const LOCALES = ["sk", "cs", "en"];
const OFFLINE_PAGES = LOCALES.map((l) => `/${l}/~offline`);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("offline-v1").then((c) => c.addAll(OFFLINE_PAGES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== "offline-v1").map((k) => caches.delete(k))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        const url = new URL(event.request.url);
        const locale = url.pathname.split("/")[1];
        const page = LOCALES.includes(locale)
          ? `/${locale}/~offline`
          : "/sk/~offline";
        return caches.match(page);
      })
    );
  }
});
