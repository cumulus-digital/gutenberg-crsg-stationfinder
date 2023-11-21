const path = require('path')
let defaultConfig = require('./node_modules/@wordpress/scripts/config/webpack.config.js');
//const { VueLoaderPlugin } = require('vue-loader')

//defaultConfig.plugins.push(new VueLoaderPlugin());
defaultConfig.module.rules.push(
	/*
	{
		test: /\.vue$/,
		loader: 'vue-loader'
	},
	*/
	{
		test: /\.m?jsx?$/,
		exclude: /node_modules|backend\.js/,
		use: {
			loader: 'babel-loader',
			options: {
				presets: [
					'@babel/preset-react',
					'@babel/preset-env',
				],
				plugins: [
					['@babel/plugin-transform-runtime'],
					[
						'@babel/plugin-transform-react-jsx',
						{
							pragma: 'h',
							pragmaFrag: 'Fragment',
						},
					],
				],
			},
		},
	},
);

//defaultConfig.resolve.alias.vue = 'vue/dist/vue.runtime.esm-browser.prod.js';
module.exports = {
	...defaultConfig,
	entry: {
		backend: path.resolve(process.cwd(), 'src', 'backend.js'),
		frontend: path.resolve(process.cwd(), 'src', 'frontend.js')
	},
};