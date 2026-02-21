import path from 'node:path'
import { fileURLToPath } from 'node:url'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { UiStudioWebpackPlugin } from '@dennation/ui-studio/webpack'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('webpack').Configuration} */
const config = {
	entry: './src/main.tsx',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'bundle.js',
		clean: true,
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
			},
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './src/index.html',
		}),
		new UiStudioWebpackPlugin(),
	],
	devServer: {
		port: 3001,
		hot: true,
	},
}

export default config
