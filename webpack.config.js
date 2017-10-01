'use strict';
const path = require('path');

module.exports = {
  entry: [
    './client'
  ],
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist'),
    publicPath: ''
  },
  devtool: 'soruce-map',
  resolve: {
    extensions: ['.tsx', '.js', '.html', '.css'],
  },
  context: __dirname,
  target: 'web',
  module: {
    rules: [
      { test: /\.tsx?$/, use: 'awesome-typescript-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ]
  }
};
