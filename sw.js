// ========================================= */
// STICKMATE SERVICE WORKER - v3
// ========================================= */

const CACHE_NAME = 'stickmate-v3';

const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './logo-v2.png',
    './icon-192-v2.png',
    './icon-512-v2.png'
];

// ========================================= */
// INSTALL EVENT
// ========================================= */
self.addEventListener('install', event => {
    console.log('🔧 Service Worker installing... v3');
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('✅ Cache opened:', CACHE_NAME);
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('❌ Cache add failed:', error);
            })
    );
});

// ========================================= */
// FETCH EVENT - Network First, Cache Fallback
// ========================================= */
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });
                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});

// ========================================= */
// ACTIVATE EVENT
// ========================================= */
self.addEventListener('activate', event => {
    console.log('🚀 Service Worker activating... v3');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Old caches cleared');
            return self.clients.claim();
        })
    );
});

// ========================================= */
// MESSAGE EVENT
// ========================================= */
self.addEventListener('message', event => {
    if (event.data && event.data.action === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data === 'CLEAR_CACHE') {
        caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
                caches.delete(cacheName);
            });
            console.log('🗑️ All caches cleared');
        });
    }
});

console.log('📦 StickMate Service Worker loaded - v3');