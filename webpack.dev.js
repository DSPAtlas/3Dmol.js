/* eslint-disable no-undef*/
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    filename: '[name].js',
  },
}); 

/*const path = require('path');

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '3dmol.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'ThreeDmol',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
};*/