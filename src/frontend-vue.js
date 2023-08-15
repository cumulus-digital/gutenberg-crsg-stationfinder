import './scss/frontend.scss'
import Vue from 'vue'
import StationFinder from './vue/StationFinder.vue'

const place = document.querySelector('.crsg-stationfinder');
if (place) {
	place.append(document.createElement('station-finder'));
	new Vue({
		el: 'station-finder',
		render: h => h(StationFinder),
	});
}