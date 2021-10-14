const CACHE_NAME = 'my-site-cache-v3';
const DATA_CACHE_NAME = 'data-cache-v3';

const FILES_TO_CACHE = [
	'/',
	'/index.html',
	'/favicon.ico',
	'/manifest.json',
	'/assets/css/style.css',
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
	evt.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			console.log('Your files ere pre-cached succesfully! Yes!');
			return cache.addAll(FILES_TO_CACHE);
		})
	);
	self.skipWaiting();
});

self.addEventListener('activate', function (evt) {
	evt.waitUntil(
		caches.keys().then((keyList) => {
			if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
				console.log('Removing old cache data ', key);
				return caches.delete(key);
			}
		})
	);
	self.clients.claim();
});

self.addEventListener('fetch', function (evt) {
	evt.waitUntil(
		caches.keys().then((keyList) => {
			return Promise.all(
				keyList.map((key) => {
					if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
						console.log('removing old cache data', key);
						return caches.delete(key);
					}
				})
			);
		})
	);
	self.clients.claim();
});

self.addEventListener('activate', function (evt) {
	if (evt.request.url.includes('/api/')) {
		evt.respondWith(
			caches
				.open(DATA_CACHE_NAME)
				.then((cache) => {
					return fetch(evt.request)
						.then((response) => {
							if (response.status === 200) {
								cache.put(evt.request.url, response.clone());
							}

							return response;
						})
						.catch((err) => {
							// request failed, try to get it from cache
							return cache.match(evt.request);
						});
				})
				.catch((err) => console.log(err))
		);

		return;
	}
	// If the request path does not include /api/, then we can assume the request is for a static file.
	// Add the following code in the function handling the fetch event, right below the code handling the requests to /api/:
	evt.respondWith(
		fetch(evt.request).catch(function () {
			return caches.match(evt.request).then(function (response) {
				if (response) {
					return response;
				} else if (evt.request.headers.get('accept').includes('text/html')) {
					return caches.match('/');
				}
			});
		})
	);
});
