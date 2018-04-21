/* eslint-env node */

"use strict";

// Let's  offer a minified UMD build of Parsimmon, while keeping the main
// library as a Node.js module.

const path = require("path");

const tsRule = {
  test: /\.[tj]s$/,
  use: "ts-loader"
};

module.exports = {
  entry: "./src/parsimmon.ts",
  node: false,
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname, "build"),
    library: "Parsimmon",
    libraryTarget: "umd",
    globalObject: "typeof self !== 'undefined' ? self : this",
    filename: "parsimmon.min.js"
  },
  resolve: {
    extensions: [".js", ".ts"]
  },
  module: {
    rules: [tsRule]
  }
};
