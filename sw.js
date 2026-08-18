const CACHE_NAME = 'rl-widgets-v2';
const PRECACHE_URLS = [
  './pomodoro.html',
  './cronometro.html'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) {
        if (k !== CACHE_NAME) return caches.delete(k);
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = req.url;
  var isAsset = url.indexOf('github.io') !== -1 || url.indexOf('fonts.googleapis') !== -1 || url.indexOf('fonts.gstatic') !== -1;
  if (!isAsset) return;

  event.respondWith(
    caches.match(req).then(function(cached) {
      var fetchPromise = fetch(req).then(function(fresh) {
        if (fresh && fresh.status === 200) {
          var clone = fresh.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(req, clone);
          });
        }
        return fresh;
      }).catch(function() {
        return cached;
      });
      return cached || fetchPromise;
    })
  );
});
