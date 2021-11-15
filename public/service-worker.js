const APP_PREFIX = 'BudgetTracker';
const VERSION = 'v1.2';
const CACHE_NAME = APP_PREFIX + VERSION;
const DATA_CACHE_NAME = 'data-cache-' + VERSION;


const FILES_TO_CACHE = [
	'/index.html',
	'/favicon.ico',
	'/manifest.json',
	"/api/transaction",
	'/assets/css/styles.css',
	'/assets/js/index.js',
	'/assets/js/idb.js',
	'/assets/images/icons/icon-72x72.png',
	'/assets/images/icons/icon-96x96.png',
	'/assets/images/icons/icon-128x128.png',
	'/assets/images/icons/icon-144x144.png',
	'/assets/images/icons/icon-152x152.png',
	'/assets/images/icons/icon-192x192.png',
	'/assets/images/icons/icon-384x384.png',
	'/assets/images/icons/icon-512x512.png',
];

// install the service worker
self.addEventListener('install', function (evt) {
	// wait until enclosing code is complete
	evt.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			console.log('Your files are pre-cached successfully!' + CACHE_NAME);
			// adds all files from event to cache
			return cache.addAll(FILES_TO_CACHE);
		})
	);
	self.skipWaiting();
});

self.addEventListener('fetch', function(evt){
	if (evt.request.url.includes('/api/')) {
		evt.respondWith(
			caches.open(DATA_CACHE_NAME).then(cache => {
				return fetch(event.request)
				.then(response => {
					if (response.status=== 200) {
						cache.put(event.request.url, response.clone());
					}
					return response;
				});
				
			}).catch(err => console.log(err))
		);
		return;
	}
	evt.respondWith(
		fetch(evt.request).catch(function() {
			if (response) {
				return response;
			} else if (evt.request.headers.get('accept').includes('text/html')) {
				// return cached home page
				return caches.match('/');
			}

		})
	)
})

self.addEventListener('activate', function (evt) {
	evt.waitUntil(
		caches.keys().then(function(keyList){
			const cacheKeepList = keyList.filter(function(key){
				return key.indexOf(APP_PREFIX);
			})
			cacheKeepList.push(CACHE_NAME);
			return Promise.all(keyList.map(function(key, i){
				if(cacheKeepList.indexOf(key) === -1) {
					return caches.delete(keyList[i]);
				}
			}))
		})
		
	);
	// self.clients.claim();
});



