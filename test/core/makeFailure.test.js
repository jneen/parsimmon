"use strict";

describe("Parsimmon.makeFailure", function() {
  it("creates a failure result", function() {
    var furthest = 4444;
    var expected = "waiting in the clock tower";
    var result = Parsimmon.makeFailure(furthest, expected);
    assert.deepEqual(result, {
      status: false,
      index: -1,
      value: null,
      furthest: furthest,
      expected: [expected]
    });
  });
  it("creates a result with multiple expected values", function() {
    var furthest = 4444;
    var expected = ["once", "twice", "three times a lady"];
    var result = Parsimmon.makeFailure(furthest, expected);
    assert.deepEqual(result, {
      status: false,
      index: -1,
      value: null,
      furthest: furthest,
      expected: expected
    });
  });
});
