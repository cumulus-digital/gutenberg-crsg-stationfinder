/**
 * BLOCK: crsg-stationfinder
 *
 * Front-end scripting
 */
/*eslint no-console: [0]*/
import 'intersection-observer';
import Vue from 'vue/dist/vue.esm.js';
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
		flatten: flatten,
		uniq: uniq,
		debounce: debounce,
		map: map,
		sortBy: sortBy,
		union: union,
	};

	function getStates( states, selectedState, selectedCity, selectedFormat ) {
		if ( ! states.length ) {
			return [];
		}
		if ( selectedState !== 'all' ) {
			states = _.flatten( states.filter( function( state ) {
				if ( state.abbr === selectedState ) {
					return state;
				}
			} ) );
		}
		if ( selectedState !== 'all' && selectedCity !== 'all' ) {
			states = _.flatten( states.filter( function( state ) {
				if ( state.cities.indexOf( selectedCity ) > -1 ) {
					return state;
				}
			} ) );
		}
		if ( selectedFormat !== 'all' ) {
			states = _.flatten( states.filter( function( state ) {
				if ( state.formats.indexOf( selectedFormat ) > -1 ) {
					return state;
				}
			} ) );
		}
		return states;
	}

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
						<select v-model="selected_state" id="stations-states">
							<option value="all">All</option>
							<option v-for="state in states" v-bind:value="state.abbr">{{state.name}}</option>
						</select>
					</div>
					<div class="crsg-sf-cities">
						<label for="stations-cities">
							Market City:
						</label>
						<select v-model="selected_city" id="stations-cities">
							<option value="all">All</option>
							<option v-for="city in filteredCities" v-bind:value="city">{{city}}</option>
						</select>
					</div>
					<div class="crsg-sf-formats">
						<label for="stations-formats">
							Formats:
						</label>
						<select v-model="selected_format" id="stations-formats">
							<option value="all">All</option>
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
				<div class="crsg-sf-stations">
					<a :href="station.url" target="_blank" class="crsg-sf-station" v-for="station in filteredStations">
						<figure>
							<v-lazy-image :src="station.image" src-placeholder="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" />
						</figure>
						<h3>{{station.id}}</h3>
						<div class="crsg-sf-details">{{station.freq}} {{station.band}} / {{station.format}}</div>
						<div class="crsg-sf-locale">{{station.city}}, {{station.state}}</div>
					</a>
				</div>
			</div>
		`,
		methods: {
			debounceQuery: _.debounce( function( e ) {
				this.query = e.target.value;
			}, 200 ),
		},
		computed: {
			filteredStates: function( ) {
				const states = getStates(
					this.states,
					this.selected_state,
					this.selected_city,
					this.selected_format
				);

				if ( states.length === 1 ) {
					this.selected_state = states[ 0 ].abbr;
				}
				return states;
			},
			filteredCities: function( ) {
				const states = getStates(
					this.states,
					this.selected_state,
					this.selected_city,
					this.selected_format
				);
				const cities = _.flatten( _.map( states, 'cities' ) );

				if ( cities.length === 1 ) {
					this.selected_city = cities[ 0 ];
				}
				return cities.sort( );
			},
			filteredFormats: function( ) {
				if ( this.selected_state === 'all' ) {
					return _.uniq( _.flatten( _.map( this.states, 'formats' ) ) );
				}
				const states = getStates(
					this.states,
					this.selected_state,
					this.selected_city,
					this.selected_format
				);
				const formats = _.uniq( _.flatten( _.map( states, 'formats' ) ) );

				if ( formats.length === 1 ) {
					this.selected_format = formats[ 0 ];
				}
				return formats.sort( );
			},
			filteredStations: function( ) {
				const props = this;
				const stations = this.stations.filter( function( station ) {
					let ret = station;
					if ( props.query.length ) {
						const searchable = [
							station.id,
							station.format,
							station.freq,
							station.band,
							station.city,
							station.state,
						];
						let found = false;

						searchable.forEach( function( value ) {
							if ( value.toLowerCase( ).indexOf( props.query.toLowerCase( ) ) > -1 ) {
								found = true;
							}
						} );
						if ( ! found ) {
							ret = null;
						}
					}
					if ( props.selected_state !== 'all' && station.state !== props.selected_state ) {
						ret = null;
					}
					if ( props.selected_city !== 'all' && station.city !== props.selected_city ) {
						ret = null;
					}
					if ( props.selected_format !== 'all' && station.format !== props.selected_format ) {
						ret = null;
					}
					if ( ret ) {
						return ret;
					}
				} );

				_.sortBy( stations, [ 'city', 'state', 'id' ] );

				return stations;
			},
		},
		watch: {
			selected_state: function( ) {
				this.selected_city = 'all';
				if ( ! this.filteredFormats.includes( this.selected_format ) ) {
					this.selected_format = 'all';
				}
			},
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
