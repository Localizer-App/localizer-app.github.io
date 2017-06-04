'use strict';

if ( 'serviceWorker' in navigator ) {
	navigator.serviceWorker.register('/sw.js', {scope: '/'})
	.then(function(reg) {
		console.log('Registration succeeded. Scope is ' + reg.scope);
	}).catch(function(error) {
		console.log('Registration failed with ' + error);
	});
}


const main = document.getElementById('content'), modal = document.getElementById('modal');

document.body.addEventListener( 'click', populateShell );
function populateShell(event) {
	let target = event.target;
	
	// Remove the modal window if clicked outside of the box.
	if ( target.id == 'overlay' ) {
		modal.classList.remove('active');
		return;
	}

	// Check if we clicked on a hyperlink.
	while ( target && ! target.href ) {
		target = target.parentNode;
	}
		
	if ( target ) {
		event.preventDefault();
		if ( target.href === document.location.href )
			return;

		changeUrl(target.href);

		loadPage();

		return;
	}
}

/** Change the current url of the page. */
function changeUrl(url) {
	setIndexClass(url);

	history.pushState(null, null, url);
}

function loadPage() {
	const url = document.location.href;

	Promise.all([fetchPartial(url), pageFadeOut()]).then(function(content) {
		main.innerHTML = content[0];
		main.classList.remove('transition-page');
	});
}

function listPage(data) {
	Promise.all([generatePartial(data), pageFadeOut()]).then(function(content) {
		main.innerHTML = content[0];
		main.classList.remove('transition-page');
	});
}

function setIndexClass(url) {
	if ( url.endsWith('index.html') ) {
		document.body.classList.add('index');
	} else {
		document.body.classList.remove('index');
	}
}

function fetchPartial(url) {
	url = url.replace('github.io/', 'github.io/assets/html/partials/' );

	return fetch(url, {
		method: 'GET'
	}).then(function(response) {
		return response.text();
	});
}

function generatePartial(data) {
	let content = document.createElement('div'), template;

	changeUrl(data.template);
	return fetch(data.template.replace('github.io/', 'github.io/assets/html/partials/' ), {
		method: 'GET'
	}).then(function(response) {
		return response.text();
	}).then(function(text) {
		return window[data.func](text, data.data);
	});
}

function showParkingLot(el) {
	let name = el.dataset.name || 'Parking';
	let distance = el.dataset.distance || 0;
	let price = el.dataset.price || 0;
	let rating = el.dataset.rating || 1;
	let spots = el.dataset.spots || 1;

	modal.innerHTML = `<h2 class="darken padding page-title">${name}</h2><div class="padding"><ul><li>Price: €${price}<li>Distance: ${distance} m</ul><input type="button" class="darken" data-name="${name}" data-distance="${distance}" data-price="${price}" onclick="startParking(this);" value="Start navigating"></div>`;
	modal.classList.add('active');
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pageFadeOut() {
	return new Promise(function(resolve, reject) {
		main.addEventListener( 'transitionend', resolve, { once: true } );
		main.classList.add('transition-page');
	});
}

/** Initilizes the generating of available parking lots. */
function listParkingLots(event) {
	event.preventDefault();
	
	let mainForm = document.forms['main-form'];
	
	let data = {
		data: {
			location: mainForm[0].value,
			distance: mainForm[3].value,
		},
		func: 'generateParkingLots',
		template: '/assets/html/partials/search.html',
	};

	listPage(data);
}

function generateParkingLots(text, data) {
	let content = document.createElement('div'), template, children, clone, distance = 10, price, name, rating, spots;

	content.innerHTML = text;
	content.childNodes[0].innerHTML = `Localize your spot near &ldquo;${data.location}&rdquo;!`;
	template = content.querySelector('#template');
		
	children = template.content.childNodes[1];
	
	let i = 0;
	let fullStar = '<svg class="icon" viewBox="0 0 32 32"><path d="M16 2.6l4 9.2 10 1-7.4 6.8 2 9.8-8.6-5-8.6 5 2-9.8-7.4-6.8 10-1z"></path></svg>';
	let halfStar = '<svg class="icon" viewBox="0 0 32 32"><path d="M30 12.8l-10-1-4-9.2-4 9.2-10 1 7.4 6.6-2 9.8 8.6-4.8 8.6 5-2-9.8 7.4-6.8zM19.6 20.2l0.6 3.2-2.8-1.6-1.4-1v-10.8l1.4 3 0.6 1.6 1.8 0.2 3.2 0.4-2.4 2.2-1.4 1 0.4 1.8z"></path></svg>';
	
	while ( true ) {
		name = 'Parking ' + (++i);
		distance = getRandomInt(distance/10, distance/10 + 50) * 10;
		price = getRandomInt(10, 500)/100;
		rating = getRandomInt(1,10);
		spots = getRandomInt(1, 150);
		
		if ( distance > data.distance ) {
			break;
		}
		
		children.dataset.name = name;
		children.dataset.distance = distance;
		children.dataset.price = price;
		children.dataset.rating = rating;
		children.dataset.spots = spots;
		
		children.childNodes[1].innerHTML  = name + ' (<span class="rate small">' + fullStar.repeat(Math.floor(rating/2)) + halfStar.repeat(Math.floor(rating%2)) + '</span>)';
		children.childNodes[3].textContent  = distance + 'm';
		children.childNodes[5].textContent  = spots + ' spots available';
		children.childNodes[7].textContent  = '€' + price + '/h';
		clone = document.importNode(template.content, true);
		template.nextSibling.appendChild(clone);
	}

	return content.innerHTML;
}

function startParking(el) {
	let name = el.dataset.name || 'Parking';
	let distance = el.dataset.distance || 0;
	let price = el.dataset.price || 0;
	let rating = el.dataset.rating || 1;
	let spots = el.dataset.spots || 1;
	
	modal.classList.remove('active');

	let data = {
		data: {
			name,
			distance,
			price,
			rating,
			spots
		},
		func: 'navigateParkingLot',
		template: '/assets/html/partials/navigate.html',
	};
	
	listPage(data);
}

function navigateParkingLot(text, data) {
	let content = document.createElement('div');
	content.innerHTML = text;
	
	content.childNodes[0].innerHTML = `${data.name} (${data.distance} m)`;
	content.childNodes[2].childNodes[6].childNodes[7].innerHTML = Math.round(data.distance*0.015)/10 + ' min';
	//console.log(content.childNodes[2].childNodes[6].childNodes, content.childNodes[2].childNodes[6].childNodes[7].innerHTML);
	
	main.dataset.name = data.name;
	main.dataset.distance = data.distance;
	main.dataset.price = data.price;
	main.dataset.rating = data.rating;
	main.dataset.spots = data.spots;

	return content.innerHTML;
}

/** Sort the results. */
function sortResults(el) {
	let sortContainer = document.querySelector('#' + el.dataset.container);
	let attr = el.value;
	
	let elements = Array.prototype.slice.call(sortContainer.children, 0);
	
	let dataA, dataB;
	elements.sort(function(a, b) {
		dataA = a.getAttribute( 'data-' + attr );
		dataB = b.getAttribute( 'data-' + attr );

		if ( attr === 'rating' || attr === 'spots' )
			return dataB - dataA;

		return dataA - dataB;
	});
	
	sortContainer.innerHTML = '';

	for( let i = 0, l = elements.length; i < l; i++)
		sortContainer.appendChild(elements[i]);
}

function stopPark(el) {
	//if ( el.classList.contains('started') ) {
		let star =  '<svg class="icon" viewBox="0 0 32 32" onclick="adjustRating(this);"><path d="M16 2.6l4 9.2 10 1-7.4 6.8 2 9.8-8.6-5-8.6 5 2-9.8-7.4-6.8 10-1z"></path></svg>';
		
		modal.innerHTML = `<h2 class="darken padding page-title">Rate &ldquo;${main.dataset.name}&rdquo;</h2><div class="padding"><div class="rate">${star.repeat(5)}</div><input type="button" class="darken" onclick="modal.classList.remove('active');" value="Rate"></div>`;
		modal.classList.add('active');
	/*	el.classList.remove('started');
		el.value = 'Start parking';
	} else {
		el.classList.add('started');
		el.value = 'Stop parking';
	}*/
}

function startPark(el) {
	main.dataset.startTime = Date.now();
	
	//changeUrl('/localizer/rate.html');
	
	let data = {
		data: {},
		func: 'generateStopPark',
		template: '/assets/html/partials/rate.html',
	};

	listPage(data);
}

function generateStopPark(text, data) {
	let content = document.createElement('div');
	content.innerHTML = text;
	
	let date = new Date(+main.dataset.startTime);
	content.childNodes[0].textContent = 'Stop parking';
	content.childNodes[2].childNodes[0].textContent = `Since ${date.toLocaleTimeString()}`;

	return content.innerHTML;
}

function adjustRating(el) {
	el.parentNode.childNodes.forEach(function(element) {
		element.classList.remove('selected');
	});
	
	el.classList.add('selected');
}

/*
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}*/

var mouseUp = true;
document.addEventListener( 'mouseup', () => { mouseUp = true; } );
	
class Wave {
	/**
	 * Construct the new wave.
	 *
	 */
	constructor(position, waveContainer) {
		//mouseUp = false; // TODO remove
		const xStart = position.x || 0;
		const yStart = position.y || 0;
		const maxRadius = Math.min(position.maxRadius, 450);
		
		this.wave = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		this.wave.classList.add('wave');
		this.wave.setAttributeNS(null,'cx', xStart);
		this.wave.setAttributeNS(null,'cy', yStart);
		this.wave.setAttributeNS(null,'r', maxRadius);

		this.timeMouseDown = this.now();
		this.timeMouseUp = 0; // TODO 
		this.maxDuration = Math.min(maxRadius, 150)/2 + 150; // v = 1.2
			

		waveContainer.waves.push(this);
		waveContainer.appendChild(this.wave);
			
		this.draw();
	}
		
	startMouseUp() {
		this.timeMouseUp = this.now();
	}
		
	calculateScale(animationDuration) {
		return 1 - Math.exp(-animationDuration/this.maxDuration);
		return Math.min(animationDuration/this.maxDuration, 1);
	}

	draw(timestamp) {
		if ( mouseUp && ! this.timeMouseUp ) {
			this.startMouseUp();
		}

		const wave = this.wave;
			
		const opacity = this.timeMouseUp
			? this.calculateOpacity(timestamp - this.timeMouseUp)
			: 1;
			
		// If the ripple is (almost) invisible, remove it.
		if ( opacity <= 0.01 ) {
			this.wave.parentNode.removeChild(this.wave);
			return true;
		}
		wave.style.opacity = opacity;
		
		const scale = this.calculateScale(timestamp - this.timeMouseDown);
		wave.style.transform = `scale(${scale})`;
		
	}
}
	
/**
 * Determines the opacity of the wave at a given point in time.
 *
 * @param {int} time 
 */
Wave.prototype.calculateOpacity = function(time) {
	return Math.exp(-2*/*5/(1 + 4*Math.exp(*/time/this.maxDuration)/*)*/;
}

Wave.prototype.now = function() {
	return performance.now(); // TODO compatibility
}
	
	
/**
 * Calculates the maximum distance between a point and its boundaries.
 *
 * @param 
 * @param 
 * @return {int} Largest distance to the corners of rect.
 */
function maxDistanceToCorners(position, rect) {
	const width = Math.max( position.x, rect.width - position.x );
	const height = Math.max( position.y, rect.height - position.y );
	return Math.sqrt( height * height + width * width );
}
	
/**
 * Initilizes a new wave whenever the button is pressed.
 *
 */
function startRippleEffect(ev) {
	mouseUp = false;
		
	let waveContainer = this.querySelectorAll('.wave-container')[0];
	if ( ! waveContainer ) {
		waveContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		waveContainer.classList.add('fill-content', 'wave-container');
		ariaAttribute( waveContainer );
		waveContainer.waves = [];
		this.appendChild(waveContainer);
	}
		
	const rect = waveContainer.getBoundingClientRect();

	const x = this.hasAttribute( 'data-ripple-center' ) ? rect.width/2 : ev.clientX - rect.left;
	const y = this.hasAttribute( 'data-ripple-center' ) ? rect.height/2 : ev.clientY - rect.top;
	
	const maxRadius = maxDistanceToCorners({x, y}, rect)
		
	// Initilize new wave
	new Wave({x, y, maxRadius}, waveContainer);
		
	// Start the animation if if hasn't started already.
	if ( ! waveContainer.isAnimating_ ) {
		waveContainer.isAnimating_ = true;
		requestWaveAnimation(waveContainer);
	}

	//waveContainer.classList.add('animate');
}
	
function requestWaveAnimation(waveContainer) {
	return window.requestAnimationFrame(function(timestamp) {
		animate(timestamp, waveContainer);
	} );
}

/**
 * Animates the waves.
 *
 */
function animate(timestamp, waveContainer) {
	const waves = waveContainer.waves;
	let length = waves.length,
		wave;
		
	// If there're no waves left to animate, stop the animation.
	if ( ! length ) {
		waveContainer.isAnimating_ = false;
		return false;
	}
		
	//startOpacity = ! startOpacity && mouseUp;

	while ( length-- ) {
		wave = waves[length];

		if ( wave.draw(timestamp) ) {
			//waveContainer.removeChild(wave);
			wave = null; // TODO cleanup
			waves.splice(length, 1);
			//i--;
			//length--;
		}
	}
	requestWaveAnimation(waveContainer);
	//window.requestAnimationFrame(() => animate(waveContainer));
}
	
/**
 * When the user releases the mouse, let the wave fade out.
 *
 */
/*function stopRippleEffect(ev) {
	ev.preventDefault();
	
	const waveContainer = this.querySelector('.wave-container');
	const waves = waveContainer.waves;
	
	let length = waves.length;
	while ( length-- ) {
		waves[length].startMouseUp();
	}
		
	this.classList.remove('pressed');
}*/
	
var rippleItems = document.querySelectorAll('#bottom-menu > a');
rippleItems.forEach(rippleItem => {
	rippleItem.addEventListener( 'mousedown', startRippleEffect );
	//rippleItem.addEventListener( 'mouseup', stopRippleEffect );
	rippleItem.addEventListener( 'click', (ev) => ev.preventDefault() );
})

/**
 * Sets the correct WAI-ARIA atribute to an element.
 *
 * @param 
 * @param {string} property Name of the attribute.
 * @param {string} value Value of the attribute.
 */
function ariaAttribute( element, property = 'hidden', value = 'true' ) {
	const attribute = `aria-${property}`;
	if ( 'false' !== value )
		element.setAttribute( attribute, value );
	else if ( element.hasAttribute( attribute ) )
		element.removeAttribute( attribute );
}
