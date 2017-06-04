self.addEventListener('install', function(event) {
	event.waitUntil(
		caches.open('v1').then(function(cache) {
			return cache.addAll([
				'/index.html',
				'/assets/images/Logo_Top.png',
				'/assets/images/Route.jpg',
				'/assets/html/partials/index.html',
				'/assets/html/partials/navigate.html',
				'/assets/html/partials/rate.html',
				'/assets/html/partials/search.html',
				'/assets/html/partials/settings.html',
				'/assets/html/partials/transactions.html',
				'/assets/css/style.css',
				'/assets/js/script.js',
			]);
		})
	);
});

self.addEventListener('fetch', function(event) {
	console.log(event.request.url);
	if ( event.request.url.endsWith('.html') && ! event.request.url.includes('partial/') ) {
		caches.match('/index.html').then(function(response) {
			return response;
		})
	}

	event.respondWith(
		caches.match(event.request).then(function(response) {
			return response || fetch(event.request);
		})
	);
});
