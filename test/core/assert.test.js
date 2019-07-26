"use strict";

describe("assert", function() {
  it("fails if given condition is false", function() {
    function condition1() {
      return false;
    }
    function condition2() {
      return true;
    }
    var p0 = Parsimmon.string("a");
    var p1 = p0.assert(condition1, "parsing error");
    var p2 = p0.assert(condition2, "parsing error");
    assert.deepEqual(p1.parse("a"), {
      status: false,
      expected: ["parsing error"],
      index: { offset: 1, line: 1, column: 2 }
    });
    assert.deepEqual(p1.parse("b"), {
      status: false,
      expected: ["'a'"],
      index: { offset: 0, line: 1, column: 1 }
    });
    assert.deepEqual(p2.parse("a"), { status: true, value: "a" });
    assert.deepEqual(p2.parse("b"), {
      status: false,
      expected: ["'a'"],
      index: { offset: 0, line: 1, column: 1 }
    });
  });
});
