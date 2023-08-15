import { h, Component } from 'preact';

export default class FilterSelector extends Component {
	render(props) {
		return (
			<li className={`crsg-sf-${type}`}>
				<label for={`stations-${type}`}>
					{props.label}
				</label>
				<select
					id={`stations-${type}`}
					value={props.value}
					onChange={props.onChange}
				>
					<option key="all" value="all">All</option>
					{props.options.map(o => {
						<option key={o.key || o.value} value={o.value}>{o.name}</option>
					})}
				</select>
			</li>
		)
	}
}