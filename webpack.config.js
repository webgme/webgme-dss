const path = require('path');

module.exports = {
    devtool: 'source-map',
    entry: './src/index.js',
    mode: 'development',
    output: {
        filename: 'app.build.js',
        path: path.join(__dirname, 'public'),
    },
    module: {
        rules: [
            { // This is needed to load the requirejs webgme plugins (it falls back to node-require).
                parser: {
                    amd: false,
                },
            },
            {
                test: /\.(js|jsx)$/,
                include: [
                    path.resolve(__dirname, 'src'),
                    /react-components/,
                ],
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
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.jsx'],
    },
};
