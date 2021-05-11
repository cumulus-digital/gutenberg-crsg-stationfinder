const defaultConfig = require( './node_modules/@wordpress/scripts/config/webpack.config.js' );

module.exports = {
	...defaultConfig,
	resolve: { alias: { vue: 'vue/dist/vue.esm.js' } },
	entry: {
		backend: './src/backend.js',
		frontend: './src/frontend.js',
	},
};