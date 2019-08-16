let staticCacheName = 'restaurant-static-v1';

var cacheAsstes = [
    './',
    '/index.html',
    '/restaurant.html',
    '/css/styles.css',
    '/data/restaurants.json',
    '/img/logo.jpg',
    '/img/1.jpg',
    '/img/2.jpg',
    '/img/3.jpg',
    '/img/4.jpg',
    '/img/5.jpg',
    '/img/6.jpg',
    '/img/7.jpg',
    '/img/8.jpg',
    '/img/9.jpg',
    '/img/10.jpg',
    '/js/dbhelper.js',
    '/js/main.js',
    '/js/restaurant_info.js'
];

/**The install event is fired when an install is successfully completed. 
 * The install event is generally used to populate your browsers offline caching
 * capabilities with the assets you need to run your app offline.
*/
self.addEventListener('install', (event) => {
    //this ensures that the service worker will not install until the code inside waitUntil() has successfully occurred.
    event.waitUntil(
        /**
         * The caches.open() method to create a new cache called restaurant-static-v1, 
         * which will be version 1 of the site resources cache. 
         * This returns a promise for a created cache; once resolved,
         * then call a function that calls addAll() on the created cache, 
         * which for its parameter takes an array of origin-relative URLs to all the resources to cache. 
         * */
        caches.open(staticCacheName).then((cache) => {
            return cache.addAll(cacheAsstes);
        })
    );
});


/**
 * When the service worker is installed, it then receives an activate event. 
 * The primary use of onactivate is for cleanup of resources used in previous versions of a Service worker script.
 * for example getting rid of old caches.
 * This is also useful for removing data that is no longer needed to avoid filling 
 * up too much disk space — each browser has a hard limit on the amount of cache storage that a given service worker can use
 */

self.addEventListener('activate', (event) => {
    event.waitUntil(
        //loop through the caches and if the current cache isnt the cache that we'ew looping through
        // the current iteration the we want to delete it
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((cacheName) => {
                    return cacheName.startsWith('restaurant-') && cacheName != staticCacheName;
                }).map((cacheName) => {
                    return caches.delete(cacheName);
                })
            )
        })
    )
});


//fetch to be able to show cache files when offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
    );
});
