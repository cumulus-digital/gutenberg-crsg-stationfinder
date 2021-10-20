const { CleanWebpackPlugin } = require( 'clean-webpack-plugin' );
let defaultConfig = require('./node_modules/@wordpress/scripts/config/webpack.config.js');
const path = require( 'path' );
const { unset } = require('lodash');

// Ensure CleanWebpackPlugin doesn't remove composer build dir from php-scoper
let plugins = defaultConfig.plugins;
for (let i in plugins) {
	if (plugins[i] instanceof CleanWebpackPlugin) {
		plugins[i] = new CleanWebpackPlugin({
			cleanAfterEveryBuildPatterns: ['!fonts/**', '!images/**', '!composer/**'],
			cleanOnceBeforeBuildPatterns: ['**/*', '!composer/**'],
		});
	}
}
defaultConfig.plugins = plugins;

// Fix issue with svgs in CSS url()'s throwing url.replace error
let rules = defaultConfig.module.rules;
for (let i in rules) {
	if (
		rules[i].test.toString().indexOf('.svg') > -1
		&& (
			!rules[i].issuer
			|| !rules[i].issuer.toString().indexOf('jsx') > -1
		)
	) {
		rules[i].issuer = /\.jsx?$/;
	}
	// Don't inline svg
	if (
		rules[i].test.toString().indexOf('.svg') > -1
		&& rules[i].type == 'asset/inline'
	) {
		rules[i] = {};
	}
}
// Refer svgs to build path
rules.push({
	test: /\.svg$/,
	issuer: /\.(sc|sa|c)ss$/,
	type: 'asset/resource',
		generator: {
			filename: 'images/[name].[hash:8][ext]',
	},
});
defaultConfig.module.rules = rules;

module.exports = {
	...defaultConfig,
	entry: {
		backend: path.resolve( process.cwd(), 'src', 'backend.js' ),
		frontend: path.resolve( process.cwd(), 'src', 'frontend.js' ),
	},
	resolve: {
        alias: {
            vue: 'vue/dist/vue.min.js'
        },
    },
};