"use strict";

describe("assert", function() {
  it("fails if given condition is false", function() {
    function condition1() {
      return false;
    }
    function condition2() {
      return true;
    }
    var p1 = Parsimmon.string("a").assert(condition1, "parsing error");
    var p2 = Parsimmon.string("a").assert(condition2, "parsing error");
    assert.deepEqual(p1.parse("a").status, false);
    assert.deepEqual(p1.parse("a").expected, ["parsing error"]);
    assert.deepEqual(p2.parse("a").status, true);
    assert.deepEqual(p2.parse("a").value, "a");
  });
});
