// Minimal service worker — required by Chrome's install criteria.
// Keeps things simple: network-first, falls back to cache when offline.
const CACHE_NAME = 'afriq-learn-shell-v1'
const SHELL_ASSETS = ['/', '/manifest.json', '/icon-192.png', '/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)).catch(() => {})
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  // Never intercept API calls — always go to network for live data.
  if (event.request.url.includes('/api/')) return

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const resClone = res.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone)).catch(() => {})
        return res
      })
      .catch(() => caches.match(event.request))
  )
})
