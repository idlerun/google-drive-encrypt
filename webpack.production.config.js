'use strict';

var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: [
    path.join(__dirname, 'src/client/index.js')
  ],
  output: {
    path: path.join(__dirname, '/dist/'),
    filename: '[hash].min.js',
    publicPath: '/'
  },
  plugins: [
    new CopyWebpackPlugin([{ from: 'src/public', to: '' }]),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      inject: 'body',
      filename: 'index.html'
    }),
   
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: false,
      compress: {
        warnings: false,
        screw_ie8: true
      },
      output: {
        comments: false
      } 
    }),

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ],
  module: {
    loaders: [
      { test: /\.png$/, loader: 'ignore-loader' },
      { test: /\.js?$/, exclude: /node_modules/, loader: 'babel-loader' },
      { test: /\.sass$/, loaders: ["style-loader", "css-loader", "sass-loader"], include: /src/ }
    ]
  }
};
