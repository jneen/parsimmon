"use strict";

describe("fallback", function() {
  it("allows fallback result if no match is found", function() {
    var parser = Parsimmon.string("a").fallback("nothing");
    assert.deepEqual(parser.parse("a").value, "a");
    assert.deepEqual(parser.parse("").value, "nothing");
  });
});
