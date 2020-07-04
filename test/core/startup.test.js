/* global globalThis */

"use strict";

describe("startup", function() {
  it("will work when Set is not in the environment", function() {
    if (typeof require !== "undefined") {
      var origSet = globalThis.Set;
      // delete parsimmon from require cache and delete Set from environment
      delete require.cache[require.resolve("../..")];
      delete globalThis.Set;
      // require again, triggers Parsimmon without Set
      globalThis.Parsimmon = require("../..");
      assert.isNotOk(globalThis.Parsimmon.Set);
      // go back to original state
      delete require.cache[require.resolve("../..")];
      globalThis.Set = origSet;
      globalThis.Parsimmon = require("../..");
    }
  });
});
