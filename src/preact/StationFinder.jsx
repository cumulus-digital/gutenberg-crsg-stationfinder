import { h, Component } from 'preact';
import { useState, useMemo } from "preact/hooks";

import { debounce, sortBy } from 'lodash-es'
import config from './config';
import stateNames from './statenames';
import Station from './Station';

const union = (arr, ...args) => [...new Set(arr.concat(...args))];

export default class StationFinder extends Component {
	constructor() {
		super();
		this.state = {
			loading: false,
			stations: [],
			status: 'Loading...'
		}
	}

	componentDidMount() {
		this.setState({ loading: true, status: 'Loading...' });
		fetch(
			config.baseURL, { method: 'GET', headers: config.headers }
		).then(resp => {
			if (resp.status !== 200) {
				this.setState({ status: 'Failed to load stations! Please try again later.' });
				throw Response.status;
			}
			resp.json().then(data => {
				this.setState({ stations: data });
				this.setState({ loading: false });
			})
		}).catch(resp => {
			this.setState({ status: 'Failed to load stations! Please try again later. ' + (resp.reason ? resp.reason : '') });
		});
	}

	render(props, state) {
		if (state.loading) {
			return (
				<div>{state.status}</div>
			);
		}

		const [filters, setFilters] = useState({
			city: 'all',
			state: 'all',
			format: 'all',
			query: ''
		});
		const changeStateFilter = (e) => {
			const newFilters = { ...filters, state: e.target.value, city: 'all' };
			setFilters(newFilters);
		};
		const changeCityFilter = e => {
			const v = e.target.value;
			if (v == 'all') {
				setFilters({ ...filters, city: 'all' });
				return;
			}

			const s = v.substring(0, 2);
			setFilters({ ...filters, state: s, city: v });
		}
		const changeFormatFilter = e => {
			setFilters({ ...filters, format: e.target.value });
		}
		const clearQuery = e => {
			setFilters({ ...filters, query: '' });
		}

		const debounceQuery = debounce(e => {
			setFilters({ ...filters, query: e.target.value });
		}, 200);

		const relevantStations = useMemo(() => {
			const stations = state.stations.filter(station => {
				let found = true;
				if (filters.state !== 'all' && station.state !== filters.state) {
					found = false;
				}
				if (filters.city !== 'all' && station.city !== filters.city.substring(3)) {
					found = false;
				}
				if (filters.format !== 'all' && station.format !== filters.format) {
					found = false;
				}
				return found;
			});
			return stations;
		}, [state.stations, filters.state, filters.city, filters.format]);

		const filteredData = useMemo(() => {
			const prefilteredStations = relevantStations;
			const states = {},
				cities = {},
				formats = {};

			state.stations.forEach(station => {
				if (!stateNames?.[station.state]) {
					console.warn('Station found with no full state', station);
					return;
				}

				// We want all states always selectable
				states[station.state] = {
					abbr: station.state,
					name: stateNames[station.state]
				};

				// if a state is selected, always allow selecting another city
				if (filters.state === 'all' || station.state === filters.state) {
					const cityKey = `${station.state}|${station.city}`;
					cities[cityKey] = {
						key: cityKey,
						state: station.state,
						name: station.city,
					};
				}
			});

			prefilteredStations.forEach(station => {
				formats[station.format] = station.format;
			});

			const sortedStates = sortBy(Object.values(states), ['name']);
			const sortedCities = sortBy(Object.values(cities), ['name']);
			const sortedFormats = Object.values(formats).sort();

			const newFilters = { ...filters }
			if (sortedStates.length === 1) {
				newFilters.state = sortedStates[0].abbr;
			}
			if (sortedCities.length === 1) {
				newFilters.city = sortedCities[0].key;
			}
			if (sortedFormats.length === 1) {
				newFilters.format = sortedFormats[0];
			}
			setFilters(newFilters);

			const emptyFilters = { ...filters };
			if (sortedStates.length === 0) {
				emptyFilters.state = 'all';
			}
			if (sortedCities.length === 0) {
				emptyFilters.city = 'all';
			}
			if (sortedFormats.length === 0) {
				emptyFilters.format = 'all';
			}
			setFilters(emptyFilters);

			return {
				states: sortedStates,
				cities: sortedCities,
				formats: sortedFormats
			}
		}, [state.stations, filters.state, filters.city, filters.format]);

		// Generate filtered stations
		const filteredStations = useMemo(() => {
			const stations = relevantStations.filter(station => {
				if (filters.query.length) {
					const searchable = [
						station.id, station.format, station.freq,
						station.calls, station.band, station.city, station.state
					].map(v => v.toLowerCase());
					if (
						!searchable.filter(v => {
							return v.includes(filters.query.toLowerCase());
						})?.length
					) {
						return;
					}
				}
				return station;
			});

			return sortBy(stations, ['city', 'state', 'id']);
		}, [relevantStations, filters.query]);

		return (
			<div className="crsg-stationfinder">
				<ul className="crsg-sf-filters">
					<li className="crsg-sf-states">
						<label for="stations-states">
							Market State:
						</label>
						<select
							name="state"
							id="stations-states"
							value={filters.state}
							onChange={changeStateFilter}
						>
							<option key="all" value="all">All</option>
							{filteredData.states.map(s => (
								<option key={s.abbr} value={s.abbr}>{s.name}</option>
							))}
						</select>
					</li>
					<li className="crsg-sf-cities">
						<label for="stations-cities">
							City:
						</label>
						<select
							name="city"
							id="stations-cities"
							value={filters.city}
							onChange={changeCityFilter}
						>
							<option key="all" value="all">All</option>
							{filteredData.cities.map(c => (
								<option key={c.key} value={c.key}>{c.name}</option>
							))}
						</select>
					</li>
					<li className="crsg-sf-formats">
						<label for="stations-formats">
							Formats:
						</label>
						<select
							name="format"
							id="stations-formats"
							value={filters.format}
							onChange={changeFormatFilter}
						>
							<option key="all" value="all">All</option>
							{filteredData.formats.map(f => (
								<option key={f} value={f}>{f}</option>
							))}
						</select>
					</li>
					<li className="crsg-sf-search">
						<label for="stations-search">Search:</label>
						<input
							name="search"
							id="stations-search"
							type="text"
							placeHolder="Search..."
							value={filters.query}
							ariaLabel="Search"
							spellCheck={false}
							onKeyUp={debounceQuery}
						/>
						<button
							ariaLabel="Clear Search"
							onClick={clearQuery}
						>
							Clear
						</button>
					</li>
				</ul>
				<ul className="crsg-sf-stations">
					{!!filteredStations.length &&
						filteredStations.map(station => (
							<li>
								<Station {...station} />
							</li>
						))
					}
					{!!filteredStations.length ||
						<li>No stations found. Try a different filter!</li>
					}
				</ul>
			</div>
		)
	}
}