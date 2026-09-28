const CACHE_NAME = "avgm-bike-tracker-final-20260928-02";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json"
];

/* INSTALL */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});


/* ACTIVATE */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        );
      })
      .then(() => self.clients.claim())
  );
});


/* FETCH */
self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  /*
    INDEX PAGE:
    Always try network first.
    This prevents old index.html from remaining in cache.
  */
  if (
    event.request.mode === "navigate" ||
    url.pathname.endsWith("/index.html")
  ) {

    event.respondWith(

      fetch(event.request, {
        cache: "no-store"
      })

      .then(response => {

        const copy = response.clone();

        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put("./index.html", copy);
          });

        return response;
      })

      .catch(() => {
        return caches.match("./index.html");
      })

    );

    return;
  }


  /*
    OTHER FILES:
    Cache first, then network.
  */
  event.respondWith(

    caches.match(event.request)

      .then(cachedResponse => {

        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request);
      })

  );

});
