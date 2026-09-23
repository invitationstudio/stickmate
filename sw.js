// ========================================= */
// STICKMATE SERVICE WORKER - v2
// ========================================= */

const CACHE_NAME = 'stickmate-v2';

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
// INSTALL EVENT - Cache sagle files
// ========================================= */
self.addEventListener('install', event => {
    console.log('🔧 Service Worker installing... v2');
    
    // Turant activate kara (waiting skip)
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
// FETCH EVENT - Cache madhun serve kara
// ========================================= */
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache madhe asel tar return kara
                if (response) {
                    return response;
                }
                // Nasel tar network madhun ghe
                return fetch(event.request).then(networkResponse => {
                    // Jar valid response asel tar cache madhe save kara
                    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return networkResponse;
                });
            })
            .catch(() => {
                // Offline asel tar index.html dाखवा
                return caches.match('./index.html');
            })
    );
});

// ========================================= */
// ACTIVATE EVENT - Juno cache clear kara
// ========================================= */
self.addEventListener('activate', event => {
    console.log('🚀 Service Worker activating... v2');
    
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
            // Turant sagle clients control kara
            return self.clients.claim();
        })
    );
});

// ========================================= */
// MESSAGE EVENT - Force update sathi
// ========================================= */
self.addEventListener('message', event => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data === 'CLEAR_CACHE') {
        caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
                caches.delete(cacheName);
            });
            console.log('🗑️ All caches cleared by message');
        });
    }
});

console.log('📦 StickMate Service Worker loaded - v2');