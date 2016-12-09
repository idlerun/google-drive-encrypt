'use strict';

var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  devtool: 'eval-source-map',
  entry: [
    'webpack-hot-middleware/client?reload=true',
    path.join(__dirname, 'src/client/index.js')
  ],
  output: {
    path: path.join(__dirname, '/dist/'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  plugins: [
    new CopyWebpackPlugin([{ from: 'src/public', to: '' }]),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      inject: 'body',
      filename: 'index.html'
    }),
    
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ],
  module: {
    loaders: [
      { test: /\.js?$/, exclude: /node_modules/, loader: 'babel-loader' },
      { test: /\.s(a|c)ss$/, loaders: ["style-loader", "css?sourceMap", "sass?sourceMap&indentedSyntax"], include: /src/ }
    ]
  }
};