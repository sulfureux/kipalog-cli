let path = require('path')
let webpack = require('webpack')
let UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
	entry: './index.src.js',
	target: 'node',
	output: {
		filename: 'index.js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['env']
					}
				}
		    }
		]
	},
	plugins: [
		new UglifyJSPlugin({comments: false})
	],
	stats: {
		warnings: false
	}
}