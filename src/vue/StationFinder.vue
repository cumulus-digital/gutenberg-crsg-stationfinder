<template>
	<div class="crsg-stationfinder">
		<ul class="crsg-sf-filters">
			<li class="crsg-sf-states">
				<label for="stations-states">
					Market State:
				</label>
				<select v-model="filters.state" id="stations-states" @change="selectState">
					<option value="all" selected="selected" v-if="filters.state == 'all'">All</option>
					<option value="all" v-else>All</option>
					<option v-for="state in states" :value="state.abbr">{{ state.name }}</option>
				</select>
			</li>
			<li class="crsg-sf-cities">
				<label for="stations-cities">
					Market City:
				</label>
				<select v-model="filters.city" id="stations-cities" @change="selectCity">
					<option value="all" selected="selected" v-if="filters.city == 'all'">All</option>
					<option value="all" v-else>All</option>
					<option v-for="city in filteredCities" :value="city">{{ city.name }}</option>
				</select>
			</li>
			<li class="crsg-sf-formats">
				<label for="stations-formats">
					Formats:
				</label>
				<select v-model="filters.format" id="stations-formats">
					<option value="all" selected="selected" v-if="filters.format == 'all'">All</option>
					<option value="all" v-else>All</option>
					<option v-for="format in filteredFormats" :value="format">{{ format }}</option>
				</select>
			</li>
			<li class="crsg-sf-search">
				<label for="stations-search">
					Search:
				</label>
				<input id="stations-search" type="text" placeholder="Search..." v-on:keyup="debounceQuery" :value="filters.query" aria-label="Search">
				<button v-on:click="filters.query = ''" aria-label="Clear Search">Clear</button>
			</li>
		</ul>
		<ul v-if="filteredStations?.length" class="crsg-sf-stations">
			<li v-for="station in filteredStations">
				<Station v-bind="station" />
			</li>
		</ul>
		<ul v-else class="crsg-sf-stations ">
			<li>No stations found.</li>
		</ul>
	</div>
</template>

<script>
import { debounce, sortBy } from 'lodash-es'
import { APISettings } from './config.js'
import { stateNames } from './statenames.js'
import Station from './Station.vue'

const union = (arr, ...args) => [...new Set(arr.concat(...args))];

export default {
	name: 'StationFinder',
	components: { Station },
	data() {
		return {
			stations: [],
			states: {},
			filters: {
				state: 'all',
				city: 'all',
				format: 'all',
				query: '',
			}
		}
	},
	methods: {
		debounceQuery: debounce(function (e) {
			this.filters.query = e.target.value;
		}, 200),
		getFilteredStates() {
			if (!this.states?.length) {
				return [];
			}

			const props = this;
			return props.states.filter(state => {
				let found = true;
				if (
					props.filters.state !== 'all'
					&& props.filters.state !== state.abbr
				) {
					found = false;
				}
				if (
					props.filters.city !== 'all'
					&& props.filters.state !== state.abbr
				) {
					found = false;
				}
				if (
					props.filters.format !== 'all'
					&& ! state.formats.includes(props.filters.format)
				) {
					found = false;
				}

				if (found) {
					return state;
				}
			}).flat()
		},
		selectCity() {
			if (this.filters.city !== 'all') {
				this.filters.state = this.filters.city.state;
			}
		},
		selectState() {
			// reset selected city if current city is not in current state
			if (
				this.filters.city !== 'all'
				&& this.filters.city.state
				&& this.filters.city.state !== this.filters.state
			) {
				this.filters.city = 'all';
			}

			// reset selected format if there are no stations in
			// the selected state with that format
			if (
				this.filters.format !== 'all'
				&& this.filteredFormats.length < 1
			) {
				this.filters.format = 'all'
			}
		}
	},
	computed: {
		filteredStates() {
			const states = this.getFilteredStates();
			if (states.length === 1) {
				this.filters.state = states[0].abbr;
			}
			return states;
		},
		filteredCities() {
			const states = this.getFilteredStates(),
				cities = [];

			states.forEach(state => {
				state.cities.forEach(city => {
					cities.push({
						state: state.abbr,
						name: city
					});
				});
			});

			if (cities.length === 1) {
				this.filters.city = cities[0];
			}
			return sortBy(cities, ['name']);
		},
		filteredFormats() {
			if (this.filters.state === 'all') {
				if (!this.states?.length) {
					return;
				}
				return [
					...new Set(
						this.states.map(n => n.formats).flat()
					)
				];
			}

			const states = this.getFilteredStates(),
				formats = new Set(
					states.map(n => n.formats).flat()
				);

			if (formats.length === 1) {
				this.filters.format = formats[0];
			}

			return [...formats].sort()
		},
		filteredStations() {
			const props = this;

			if (!this.stations?.length) {
				return;
			}
			const stations = this.stations.filter(station => {
				if (
					props.filters.state !== 'all'
					&& props.filters.state !== station.state
				) {
					return;
				}
				if (
					props.filters.city !== 'all'
					&& props.filters.city.name !== station.city
				) {
					return;
				}
				if (
					props.filters.format !== 'all'
					&& props.filters.format !== station.format
				) {
					return;
				}
				if (props.filters.query?.length) {
					const searchable = [
						station.id,
						station.format,
						station.freq,
						station.calls,
						station.band,
						station.city,
						station.state
					].map(v => v.toLowerCase());
					if (
						!searchable.filter(v => {
							return v.indexOf(props.filters.query.toLowerCase()) > -1
						})?.length
					) {
						return;
					};
				}
				return station;
			});

			sortBy(stations, ['city', 'state', 'id']);
			return stations;
		}
	},
	created() {
		const props = this;
		return fetch(
			APISettings.baseURL,
			{
				method: 'GET',
				headers: APISettings.headers
			}
		).then(response => {
			if (response.status !== 200) {
				throw response.status;
			}
			response.json().then(data => {
				props.stations = data;

				const states = {};
				props.stations.forEach(station => {
					if (states.hasOwnProperty(station.state)) {
						states[station.state].cities = union(
							states[station.state].cities,
							[station.city]
						);
						states[station.state].formats = union(
							states[station.state].formats,
							[station.format]
						);
						return;
					}
					states[station.state] = {
						abbr: station.state,
						name: stateNames[station.state],
						cities: [station.city],
						formats: [station.format]
					};
				});

				const sortedStates = sortBy(states, 'name');
				sortedStates.forEach(state => {
					state.cities = state.cities.sort();
					state.formats = state.formats.sort();
				});
				props.states = sortedStates;
			});
		});
	}
}
</script>