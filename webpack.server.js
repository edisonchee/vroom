"use strict";

const path = require('path');

module.exports = {
  entry: './src/server/index.js',
  output: {
    filename: 'server/index.js',
    path: path.resolve(__dirname, 'dist'),
  },
};