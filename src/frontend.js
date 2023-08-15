import './scss/frontend.scss'
import { h, render } from 'preact';
import StationFinder from './preact/StationFinder';

const polyfillIntersectionObserver = (callback, global) => {
	if (
		'IntersectionObserver' in global
		&& 'IntersectionObserverEntry' in global
		&& 'intersectionRatio' in global.IntersectionObserverEntry.prototype
	) {
		callback(true);
		return;
	}

	const script = global.document.createElement('script');
	script.src =
	'https://www.gstatic.com/external_hosted/intersectionobserver_polyfill/intersection-observer.min.js';
	script.onload = () => callback(true);
	script.onerror = () => callback(false);
	global.document.body.appendChild(script);

};

polyfillIntersectionObserver((success) => {
	if (success) {
		const place = document.querySelectorAll('.crsg-stationfinder');
		if (place?.length) {
			//place.append(document.createElement('station-finder'));
			place.forEach(p => {
				render(<StationFinder />, p);
			});
		}
	}
}, window.self);
