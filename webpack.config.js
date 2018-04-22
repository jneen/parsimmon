/* eslint-env node, es6 */

"use strict";

// Let's  offer a minified UMD build of Parsimmon, while keeping the main
// library as a Node.js module.

const path = require("path");

module.exports = {
  entry: "./src/parsimmon.js",
  node: false,
  output: {
    path: path.resolve(__dirname, "build"),
    library: "Parsimmon",
    libraryTarget: "umd",
    globalObject: "typeof self !== 'undefined' ? self : this",
    filename: "parsimmon.umd.min.js"
  }
};
