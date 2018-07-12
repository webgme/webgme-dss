const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    devtool: 'source-map',
    entry: './src/index.js',
    output: {
        filename: 'app.build.js',
        path: path.join(__dirname, 'public'),
    },
    plugins: [
        new ExtractTextPlugin('app.build.css'),
    ],
    module: {

        rules: [
            { // This is needed to load the requirejs webgme plugins (it falls back to node-require).
                parser: {
                    amd: false
                }
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: [
                    'babel-loader',
                ],
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    use: 'css-loader',
                }),
            },
            {
                test: /\.svg/,
                use: {
                    loader: 'svg-url-loader',
                    options: {}
                }
            }
        ],
    },
    resolve: {
        extensions: ['.js', '.jsx'],
    },
};
