/* eslint-env node */

'use strict';

// Let's  offer a minified UMD build of Parsimmon, while keeping the main
// library as a Node.js module.

var path = require('path');

module.exports = {
  entry: './src/parsimmon.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    library: 'Parsimmon',
    libraryTarget: 'umd',
    filename: 'parsimmon.umd.min.js'
  }
};
