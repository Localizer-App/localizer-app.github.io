self.addEventListener('install', function(event) {
	event.waitUntil(
		caches.open('v1').then(function(cache) {
			return cache.addAll([
				'/localizer/index.html',
				'/localizer/assets/images/Logo_Top.png',
				'/localizer/assets/images/Route.jpg',
				'/localizer/assets/html/partials/index.html',
				'/localizer/assets/html/partials/navigate.html',
				'/localizer/assets/html/partials/rate.html',
				'/localizer/assets/html/partials/search.html',
				'/localizer/assets/html/partials/settings.html',
				'/localizer/assets/html/partials/transactions.html',
				'/localizer/assets/css/style.css',
				'/localizer/assets/js/script.js',
			]);
		})
	);
});

self.addEventListener('fetch', function(event) {
	console.log(event.request.url);
	if ( event.request.url.endsWith('.html') && ! event.request.url.includes('partial/') ) {
		caches.match('/localizer/index.html').then(function(response) {
			return response;
		})
	}

	event.respondWith(
		caches.match(event.request).then(function(response) {
			return response || fetch(event.request);
		})
	);
});
/*
response.headers.forEach(function(v,k){
    init.headers[k] = v;
})*/