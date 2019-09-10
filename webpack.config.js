const path = require('path');

module.exports = {
  target: 'electron-renderer',
  module: 'development',
  entry: './src/index.js',
  devtool: 'cheap-module-eval-source-map',
  output: {
    path: path.resolve(__dirname, 'bin'),
    filename: 'index.js',
    publicPath: '/assets/',
  },
  module: {
    rules: [
      {
        test: /\.js[x]?$/,
        exclude: /node_modules/,
        loader: ['babel-loader'],
      },
    ],
  },
  watch: true,
};