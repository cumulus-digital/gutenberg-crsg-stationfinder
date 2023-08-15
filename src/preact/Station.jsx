import { h, Component } from 'preact';
import { ViewportObserver } from "preact-intersection-observer";

export default class Station extends Component {
	constructor() {
		super();
	}
	render(props) {
		let Tag = 'div',
			attribs = {};
		if (props?.url?.length) {
			Tag = 'a';
			attribs = {
				href: props.url,
				target: "_blank",
				rel: "noopener"
			};
		}
		return (
			<Tag {...attribs}>
				{props?.image && (
					<ViewportObserver
						as="figure"
						render={({ inView, entry }) => {
							if (inView) {
								return (
									<img
										src={props.image.replace('http://', 'https://')}
										alt={`Logo for ${props.id}`}
									/>
								);
							}
							return null;
						}}
					/>
				)}
				<h3>{props.id}</h3>
				<div className="crsg-sf-locale">{props?.city}, {props?.state}</div>
				{props?.freq && <div className="crsg-sf-details">{props.freq}</div>}
				{props?.calls && <div className="crsg-sf-details">{props.calls} {props?.band}</div>}
				{props?.format && <div className="crsg-sf-details">{props.format}</div>}
			</Tag>
		)
	}
}