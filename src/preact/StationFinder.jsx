import { h, Fragment } from 'preact';
import { useLayoutEffect } from "preact/hooks";

import config from './config';
import Filters from './Filters';

const union = (arr, ...args) => [...new Set(arr.concat(...args))];

import { store } from './store';
import StationList from './StationList';

export default function StationFinder(props) {
	const refreshTime = 14400000;
	let refreshTimer;

	const fetchStations = () => {
		store.loading = true;
		store.status = 'Loading…';
		const error_msg = 'Failed to load stations! Please try again later.';

		fetch(config.baseURL, { method: 'GET', headers: config.headers })
			.then(resp => {
				if (resp.status !== 200) {
					store.status = error_msg;
					console.error('StationFinder', resp);
					return;
				}
				resp.json().then(data => {
					store._stations = data;
					store.loading = false;
				}).catch(err => {
					store.status = error_msg;
					console.error('StationFinder', err);
				})
			})
			.catch(err => {
				store.status = error_msg;
				console.error('StationFinder', err);
			});
	}

	const doFetchTime = () => {
		if (refreshTimer) clearTimeout(refreshTimer);

		fetchStations();

		refreshTimer = setTimeout(() => {
			doFetchTime();
		}, Math.random(refreshTime) + refreshTime);
	}

	useLayoutEffect(() => {
		doFetchTime();

		return () => {
			if (refreshTimer) clearTimeout(refreshTimer);
			refreshTimer = null;
		}
	}, []);

	return (
		<div class="crsg-stationfinder">
			<Filters />
			<StationList />
		</div>
	)
}


// export class StationFinder2 extends Component {
// 	refreshTime = 14400000;
// 	constructor() {
// 		super();
// 		this.state = {
// 			loading: false,
// 			stations: [],
// 			status: 'Loading...'
// 		}
// 	}

// 	fetchStations() {
// 		this.setState({ loading: true, status: 'Loading...' });
// 		fetch(
// 			config.baseURL, { method: 'GET', headers: config.headers }
// 		).then(resp => {
// 			if (resp.status !== 200) {
// 				this.setState({ status: 'Failed to load stations! Please try again later.' });
// 				throw Response.status;
// 			}
// 			resp.json().then(data => {
// 				this.setState({ stations: data });
// 				this.setState({ loading: false });
// 			}).catch(err => {
// 				this.setState({ status: 'Failed to load stations! Please try again later.' });
// 			})
// 		}).catch(err => {
// 			this.setState({ status: 'Failed to load stations! Please try again later. ' + (err.reason ? err.reason : '') });
// 		});
// 	}

// 	// Fetches data and then waits between 3 and 6 hours to do it again
// 	doFetchTime() {
// 		this.fetchStations();
// 		this.refreshTimer = setTimeout(() => {
// 			this.doFetchTime();
// 		}, Math.random(this.refreshTime) + this.refreshTime);
// 	}

// 	componentDidMount() {
// 		this.doFetchTime();
// 	}

// 	componentWillUnmount() {
// 		clearTimeout(this.refreshTimer);
// 		this.refreshTimer = null;
// 	}

// 	render(props, state) {
// 		if (state.loading) {
// 			return (
// 				<div>{state.status}</div>
// 			);
// 		}

// 		const [filters, setFilters] = useState({
// 			city: 'all',
// 			state: 'all',
// 			format: 'all',
// 			query: ''
// 		});
// 		const changeStateFilter = (e) => {
// 			const newFilters = { ...filters, state: e.target.value, city: 'all' };
// 			setFilters(newFilters);
// 		};
// 		const changeCityFilter = e => {
// 			const v = e.target.value;
// 			if (v == 'all') {
// 				setFilters({ ...filters, city: 'all' });
// 				return;
// 			}

// 			const s = v.substring(0, 2);
// 			setFilters({ ...filters, state: s, city: v });
// 		}
// 		const changeFormatFilter = e => {
// 			setFilters({ ...filters, format: e.target.value });
// 		}
// 		const clearQuery = e => {
// 			setFilters({ ...filters, query: '' });
// 		}

// 		const debounceQuery = debounce(e => {
// 			setFilters({ ...filters, query: e.target.value });
// 		}, 200);

// 		const isFiltered = (type) => {
// 			return filters?.[type] !== 'all';
// 		};
// 		const hasState = (station) => station.state === filters.state;
// 		const hasCity = (station) => station.city === filters.city.substring(3);
// 		const hasFormat = station => station.format === filters.format;

// 		const relevantStations = useMemo(() => {
// 			const stations = state.stations.filter(station => {
// 				let found = true;
// 				if (isFiltered('state') && !hasState(station)) {
// 					found = false;
// 				}
// 				if (isFiltered('city') && !hasCity(station)) {
// 					found = false;
// 				}
// 				if (isFiltered('format') && !hasFormat(station)) {
// 					found = false;
// 				}
// 				return found;
// 			});
// 			return stations;
// 		}, [state.stations, filters.state, filters.city, filters.format]);

// 		const filteredData = useMemo(() => {
// 			const stations = relevantStations,
// 				states = {},
// 				cities = {},
// 				formats = {};

// 			state.stations.forEach(station => {
// 				if (!stateNames?.[station.state]) {
// 					console.warn('Station found with no full state', station);
// 					return;
// 				}

// 				// We want all states always selectable
// 				states[station.state] = {
// 					abbr: station.state,
// 					name: stateNames[station.state]
// 				};

// 				// Always allow selecting another city in a selected state
// 				if (!isFiltered('state') || hasState(station)) {
// 					const cityKey = `${station.state}|${station.city}`;
// 					cities[cityKey] = {
// 						key: cityKey,
// 						state: station.state,
// 						name: station.city,
// 					};
// 				}

// 				if (
// 					// Show all formats if city or state is not filtered
// 					(!isFiltered('state') && !isFiltered('city'))
// 					// If city is selected, only show formats in that city
// 					|| (isFiltered('city') && hasCity(station))
// 					// If state but not city is selected, only show formats in that state
// 					|| (isFiltered('state') && !isFiltered('city') && hasState(station))
// 				) {
// 					formats[station.format] = station.format;
// 				}
// 			});

// 			const sortedStates = sortBy(Object.values(states), ['name']);
// 			const sortedCities = sortBy(Object.values(cities), ['name']);
// 			const sortedFormats = Object.values(formats).sort();

// 			const newFilters = { ...filters }
// 			if (sortedStates.length === 1) {
// 				newFilters.state = sortedStates[0].abbr;
// 			}
// 			if (sortedCities.length === 1) {
// 				newFilters.city = sortedCities[0].key;
// 			}
// 			if (sortedFormats.length === 1) {
// 				newFilters.format = sortedFormats[0];
// 			}
// 			if (sortedStates.length === 0) {
// 				newFilters.state = 'all';
// 			}
// 			if (sortedCities.length === 0) {
// 				newFilters.city = 'all';
// 			}
// 			if (sortedFormats.length === 0) {
// 				newFilters.format = 'all';
// 			}

// 			setFilters(newFilters);

// 			return {
// 				states: sortedStates,
// 				cities: sortedCities,
// 				formats: sortedFormats
// 			}
// 		}, [state.stations, filters.state, filters.city, filters.format]);

// 		// Generate filtered stations
// 		const filteredStations = useMemo(() => {
// 			const stations = relevantStations.filter(station => {
// 				if (filters.query.length) {
// 					const searchable = [
// 						station.id, station.format, station.freq,
// 						station.calls, station.band, station.city, station.state
// 					].map(v => v.toLowerCase());
// 					if (
// 						!searchable.filter(v => {
// 							return v.includes(filters.query.toLowerCase());
// 						})?.length
// 					) {
// 						return;
// 					}
// 				}
// 				return station;
// 			});

// 			return sortBy(stations, ['city', 'state', 'id']);
// 		}, [relevantStations, filters.query]);

// 		// Reset formats filter if format is filtered, city or state is selected,
// 		// and no stations are found.
// 		useMemo(() => {
// 			if (
// 				(isFiltered('state') || isFiltered('city'))
// 				&& isFiltered('format')
// 				&& ! filteredData.formats.includes(filters.format)
// 				&& filteredStations.length === 0
// 			) {
// 				setFilters({ ...filters, format: 'all' });
// 			}
// 		}, [filteredStations]);

// 		return (
// 			<div className="crsg-stationfinder">
// 				<ul className="crsg-sf-filters">
// 					<FilterSelector
// 						type="states"
// 						label="Market State:"
// 						value={filters.state}
// 						options={filteredData.states.map(s => {
// 							return {
// 								value: s.abbr,
// 								name: s.name
// 							}
// 						})}
// 						onChange={changeStateFilter}
// 					/>
// 					<FilterSelector
// 						type="cities"
// 						label="City:"
// 						value={filters.city}
// 						options={filteredData.cities.map(s => {
// 							return {
// 								value: s.key,
// 								name: s.name
// 							}
// 						})}
// 						onChange={changeCityFilter}
// 					/>
// 					<FilterSelector
// 						type="formats"
// 						label="Format:"
// 						value={filters.format}
// 						options={filteredData.formats.map(s => {
// 							return {
// 								value: s,
// 								name: s
// 							}
// 						})}
// 						onChange={changeFormatFilter}
// 					/>

// 					<li className="crsg-sf-search">
// 						<label for="stations-search">Search:</label>
// 						<input
// 							name="search"
// 							id="stations-search"
// 							type="text"
// 							placeHolder="Search..."
// 							value={filters.query}
// 							ariaLabel="Search"
// 							spellCheck={false}
// 							onKeyUp={debounceQuery}
// 						/>
// 						<button
// 							ariaLabel="Clear Search"
// 							onClick={clearQuery}
// 						>
// 							Clear
// 						</button>
// 					</li>
// 				</ul>
// 				<ul className={`crsg-sf-stations ${filteredStations.length || 'crsg-sf-none'}`}>
// 					{!!filteredStations.length &&
// 						filteredStations.map(station => (
// 							<li>
// 								<Station {...station} />
// 							</li>
// 						))
// 					}
// 					{!!filteredStations.length ||
// 						<li>No stations found. Try a different filter!</li>
// 					}
// 				</ul>
// 			</div>
// 		)
// 	}
// }