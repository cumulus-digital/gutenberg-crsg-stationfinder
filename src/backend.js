import './scss/backend.scss';

/**
 * WordPress dependencies
 */
const { __ } = wp.i18n;
const { registerBlockType } = wp.blocks;

registerBlockType( 'cumulus-gutenberg/block-crsg-stationfinder', {
	title: __( 'CRSG Station Finder' ),

	description: __( 'Gutenberg block for including data from the Cumulus Media Station Finder.' ),

	keywords: [
		__( 'crsg-stationfinder' ),
		__( 'station finder' ),
		__( 'stations' ),
	],

	supports: {
		align: [ 'wide', 'full' ],
		anchor: true,
		html: false,
	},

	category: 'widgets',

	icon: {
		src: 'format-audio',
		foreground: '#3399cc',
	},

	edit: ( props ) => {
		let { className } = props;
		className += ' crsg-stationfinder';
		
		return (
			<div className={ className }>
				Station Finder
			</div>
		);
	},

	save: ( props ) => {
		let { className } = props;
		className += ' crsg-stationfinder';

		return (
			<div className={ className }></div>
		);
	},
} );