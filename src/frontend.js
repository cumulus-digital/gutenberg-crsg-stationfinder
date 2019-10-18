/**
 * BLOCK: crsg-stationfinder
 *
 * Front-end scripting
 */
/*eslint no-console: [0]*/
import 'intersection-observer';
import Vue from 'vue/dist/vue.esm.js';
import findIndex from 'lodash-es/findIndex';
import flatten from 'lodash-es/flatten';
import uniq from 'lodash-es/uniq';
import debounce from 'lodash-es/debounce';
import map from 'lodash-es/map';
import sortBy from 'lodash-es/sortBy';
import union from 'lodash-es/union';
//import { flatten, uniq, debounce, map, sortBy, union } from 'lodash-es';
import VLazyImage from 'v-lazy-image';

( function( $, window, undefined ) { // eslint-disable-line no-unused-vars
	const _ = {
		findIndex: findIndex,
		flatten: flatten,
		uniq: uniq,
		debounce: debounce,
		map: map,
		sortBy: sortBy,
		union: union,
	};

	const finder = new Vue( { // eslint-disable-line no-unused-vars
		components: {
			VLazyImage,
		},
		el: '.crsg-stationfinder',
		data: function( ) {
			return {
				stations: [],
				states: {},
				selected_state: 'all',
				selected_city: 'all',
				selected_format: 'all',
				query: '',
			};
		},
		template: `
			<div class="crsg-sf-stationfinder">
				<div class="crsg-sf-filters">
					<div class="crsg-sf-states">
						<label for="stations-states">
							Market State:
						</label>
						<select v-model="selected_state" id="stations-states" @change="selectState">
							<option value="all" selected="selected" v-if="selected_state=='all'">All</option>
							<option value="all" v-else>All</option>
							<option v-for="state in states" v-bind:value="state.abbr">{{state.name}}</option>
						</select>
					</div>
					<div class="crsg-sf-cities">
						<label for="stations-cities">
							Market City:
						</label>
						<select v-model="selected_city" id="stations-cities" @change="selectCity">
							<option value="all" selected="selected" v-if="selected_city=='all'">All</option>
							<option value="all" v-else>All</option>
							<option v-for="city in filteredCities" v-bind:value="city" v-bind:data-state="city.state">{{city.name}}</option>
						</select>
					</div>
					<div class="crsg-sf-formats">
						<label for="stations-formats">
							Formats:
						</label>
						<select v-model="selected_format" id="stations-formats">
							<option value="all" selected="selected" v-if="selected_format=='all'">All</option>
							<option value="all" v-else>All</option>
							<option v-for="format in filteredFormats" v-bind:value="format">{{format}}</option>
						</select>
					</div>
					<div class="crsg-sf-search">
						<label for="stations-search">
							Search:
						</label>
						<input type="text" placeholder="Search..." v-on:keyup="debounceQuery" :value="query">
						<button v-on:click="query = ''">Clear</button>
					</div>
				</div>
				<div v-if="filteredStations.length" class="crsg-sf-stations">
					<a :href="station.url" target="_blank" class="crsg-sf-station" v-for="station in filteredStations">
						<figure>
							<v-lazy-image :src="station.image" src-placeholder="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" />
						</figure>
						<h3>{{station.id}}</h3>
						<div class="crsg-sf-details">{{station.freq}} {{station.band}} / {{station.format}}</div>
						<div class="crsg-sf-locale">{{station.city}}, {{station.state}}</div>
					</a>
				</div>
				<div v-else class="crsg-sf-stations">
					<span v-if="stations.length">No stations found.</span>
				</div>
			</div>
		`,
		methods: {
			debounceQuery: _.debounce( function( e ) {
				this.query = e.target.value;
			}, 200 ),
			getFilteredStates: function() {
				if (  ! this.states.length ) {
					return [];
				}
				const props = this;
				const filteredStates = _.flatten(
					this.states.filter( function( state ) {
						let found = true;
						if (
							props.selected_state !== 'all' &&
							props.selected_state !== state.abbr
						) {
							found = false;
						}
						if (
							props.selected_city !== 'all' &&
							props.selected_city.state !== state.abbr
						) {
							found = false;
						}
						if (
							props.selected_format !== 'all' &&
							! state.formats.includes( props.selected_format )
						) {
							found = false;
						}

						if ( found ) {
							return state;
						}
					} )
				);

				return filteredStates;
			},
			selectCity: function() {
				const props = this;
				props.selected_state = props.selected_city.state;
			},
			selectState: function() {
				const props = this;
				// Reset selected city if it's not in this state
				if (
					props.selected_city !== 'all' &&
					props.selected_city.state &&
					props.selected_city.state !== props.selected_state
				) {
					props.selected_city = 'all';
				}
				// Reset selected format if there are no stations
				// in this state in that format
				if (
					props.selected_format !== 'all' &&
					props.filteredFormats.length < 1
				) {
					props.selected_format = 'all'
				}
			},
		},
		computed: {
			filteredStates: function( ) {
				const states = this.getFilteredStates();

				if ( states.length === 1 ) {
					this.selected_state = states[ 0 ].abbr;
				}
				return states;
			},
			filteredCities: function( ) {
				const states = this.getFilteredStates();
				const cities = [];
				states.forEach( function( state ) {
					state.cities.forEach( function( city ) {
						cities.push({
							state: state.abbr,
							name: city,
						} );
					} );
				} );

				if ( cities.length === 1 ) {
					this.selected_city = cities[ 0 ];
				}
				return _.sortBy( cities, [ 'name' ] );
			},
			filteredFormats: function( ) {
				if ( this.selected_state === 'all' ) {
					return _.uniq( _.flatten( _.map( this.states, 'formats' ) ) );
				}
				const states = this.getFilteredStates();
				const formats = _.uniq( _.flatten( _.map( states, 'formats' ) ) );

				if ( formats.length === 1 ) {
					this.selected_format = formats[ 0 ];
				}
				return formats.sort( );
			},
			filteredStations: function( ) {
				const props = this;

				const stations = this.stations.filter( function( station ) {
					if (
						props.selected_state !== 'all' &&
						props.selected_state !== station.state
					) {
						return;
					}
					if (
						props.selected_city !== 'all' &&
						props.selected_city.name !== station.city
					) {
						return;
					}
					if (
						props.selected_format !== 'all' &&
						props.selected_format !== station.format
					) {
						return;
					}
					if ( props.query.length ) {
						let found = false;
						const searchable = [
							station.id,
							station.format,
							station.freq,
							station.band,
							station.city,
							station.state,
						];
						searchable.forEach( function( val ) {
							if ( val.toLowerCase().indexOf( props.query.toLowerCase() ) > -1 ) {
								found = true;
							}
						} );
						if ( ! found ) {
							return;
						}
					}
					return station;
				} );

				_.sortBy( stations, [ 'city', 'state', 'id' ] );
				return stations;
			},
		},
		watch: {
		},
		created: function( ) {
			const props = this;
			$.getJSON(
				'https://player.westwoodone.com/stations/stations.ashx',
				function( response ) {
					finder.stations = response;

					const states = {};

					finder.stations.forEach( function( station ) {
						if ( states.hasOwnProperty( station.state )) {
							states[ station.state ].cities = _.union(
								states[ station.state ].cities,
								[ station.city ]
							);
							states[ station.state ].formats = _.union(
								states[ station.state ].formats,
								[ station.format ]
							);
							return;
						}
						states[ station.state ] = {
							abbr: station.state,
							name: stateNames[ station.state ],
							cities: [ station.city ],
							formats: [ station.format ]
						};
					} );

					const sortedStates = _.sortBy( states, 'name' );
					sortedStates.forEach( function( state ) {
						state.cities = state.cities.sort( );
						state.formats = state.formats.sort( );
					} );
					props.states = sortedStates;
				}
			);
		},
	} );

	const stateNames = {
		AZ: 'Arizona',
		AL: 'Alabama',
		AK: 'Alaska',
		AR: 'Arkansas',
		CA: 'California',
		CO: 'Colorado',
		CT: 'Connecticut',
		DC: 'District of Columbia',
		DE: 'Delaware',
		FL: 'Florida',
		GA: 'Georgia',
		HI: 'Hawaii',
		ID: 'Idaho',
		IL: 'Illinois',
		IN: 'Indiana',
		IA: 'Iowa',
		KS: 'Kansas',
		KY: 'Kentucky',
		LA: 'Louisiana',
		ME: 'Maine',
		MD: 'Maryland',
		MA: 'Massachusetts',
		MI: 'Michigan',
		MN: 'Minnesota',
		MS: 'Mississippi',
		MO: 'Missouri',
		MT: 'Montana',
		NE: 'Nebraska',
		NV: 'Nevada',
		NH: 'New Hampshire',
		NJ: 'New Jersey',
		NM: 'New Mexico',
		NY: 'New York',
		NC: 'North Carolina',
		ND: 'North Dakota',
		OH: 'Ohio',
		OK: 'Oklahoma',
		OR: 'Oregon',
		PA: 'Pennsylvania',
		RI: 'Rhode Island',
		SC: 'South Carolina',
		SD: 'South Dakota',
		TN: 'Tennessee',
		TX: 'Texas',
		UT: 'Utah',
		VT: 'Vermont',
		VA: 'Virginia',
		WA: 'Washington',
		WV: 'West Virginia',
		WI: 'Wisconsin',
		WY: 'Wyoming',
	};
}( jQuery, window.self ) );
