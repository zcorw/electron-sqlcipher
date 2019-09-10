const path = require('path');
const pakg = require('./package.json');

module.exports = {
  target: 'node',
  mode: 'development',
  entry: {
    test: './test/index.js',
  },
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'bin'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: ['babel-loader'],
      },
    ],
  },
  watch: true,
  externals: (context, request, callback) => {
    callback(null, Object.keys(pakg.dependencies).includes(request) ? `require("${request}")` : false);
  },
};