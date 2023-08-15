import { h, Component } from 'preact';

export default class FilterSelector extends Component {
	render(props) {
		return (
			<li className={`crsg-sf-${props.type}`}>
				<label for={`stations-${props.type}`}>
					{props.label}
				</label>
				<select
					id={`stations-${props.type}`}
					value={props.value}
					onChange={props.onChange}
				>
					<option key="all" value="all">All</option>
					{props.options.map(o => {
						return <option key={o.key || o.value} value={o.value}>{o.name}</option>
					})}
				</select>
			</li>
		)
	}
}