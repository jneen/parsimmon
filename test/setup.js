/* global globalThis */

"use strict";

(function() {
  if (typeof globalThis === "object") {
    return;
  }
  Object.defineProperty(Object.prototype, "__magic__", {
    get: function() {
      return this;
    },
    configurable: true // This makes it possible to `delete` the getter later.
  });
  // eslint-disable-next-line no-undef
  __magic__.globalThis = __magic__; // lolwat
  delete Object.prototype.__magic__;
})();

// Karma loads these for us
if (typeof require !== "undefined") {
  globalThis.assert = require("chai").assert;
  globalThis.Parsimmon = require("..");
}

globalThis.equivalentParsers = function equivalentParsers(p1, p2, inputs) {
  for (var i = 0; i < inputs.length; i++) {
    assert.deepEqual(p1.parse(inputs[i]), p2.parse(inputs[i]));
  }
};
