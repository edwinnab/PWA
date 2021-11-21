const staticCacheName = 'site-static';
const dynamicCache ='site-dynamic';
//array stores the request url
const assets = [
    '/',
    '/index.html',
    '/js/app.js',
    '/js/ui.js',
    '/js/materialize.min.js',
    '/css/styles.css',
    '/css/materialize.min.css',
    '/img/dish.png',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.gstatic.com/s/materialicons/v115/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
    'https://fonts.gstatic.com/s/materialicons/v115/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2',
    '/pages/fallback.html'
];
self.addEventListener('install', evt => {
    //console.log('service worker has been installed');
    //cashing to enable offline mode
    evt.waitUntil(
        caches.open(staticCacheName).then(cache => {
            console.log('caching shell assets');
            cache.addAll(assets);
         })
    );
    
});
//listen for the active event
//this activates the service worker
self.addEventListener('activate', evt => {
    //console.log('service worker has been activated');
    evt.waitUntil(
        caches.keys().then(keys => {
            //console.log(keys);
            return Promise.all(keys
                .filter(key => key !== staticCacheName && key !== dynamicCache)
                .map(key => caches.delete(key))                
            )
        })
    );
});
//fetch events
self.addEventListener('fetch', evt => {
    //console.log('fetch event', evt);
    //enables offline behaviour
    evt.respondWith(
        caches.match(evt.request).then(cacheRes => {
            return cacheRes || fetch(evt.request).then(fetchRes => {
                return caches.open(dynamicCache).then(cache => {
                  cache.put(evt.request.url, fetchRes.clone());
                  return fetchRes;
                })
            });
        }).catch(() => {
            if(evt.request.url.indexOf('.html') > -1){
                return caches.match('/pages/fallback.html');
            }          
        })         
    );
});

