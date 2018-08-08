const path = require('path');

module.exports = {
    devtool: 'source-map',
    entry: './src/index.js',
    output: {
        filename: 'app.build.js',
        path: path.join(__dirname, 'public'),
    },
    plugins: [],
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
                use: [
                    'style-loader',
                    'css-loader',
                ],
            },
            {
                test: /\.(ttf|eot|svg)(\?v=\d\.\d\.\d)?$/,
                use: [
                    'file-loader',
                ],
            }
        ],
    },
    resolve: {
        extensions: ['.js', '.jsx'],
    },
};
