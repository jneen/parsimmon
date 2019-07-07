"use strict";

var H = require("../helpers");

describe("Fantasy Land Applicative", function() {
  it("identity", function() {
    var p1 = Parsimmon.any;
    var p2 = p1.ap(
      Parsimmon.of(function(x) {
        return x;
      })
    );
    H.equivalentParsers(p1, p2, ["x", "z", "æ", "1", ""]);
  });

  it("homomorphism", function() {
    function fn(s) {
      return s.toUpperCase();
    }
    var input = "nice";
    var p1 = Parsimmon.of(input).ap(Parsimmon.of(fn));
    var p2 = Parsimmon.of(fn(input));
    assert.deepEqual(p1.parse(""), p2.parse(""));
  });

  it("interchange", function() {
    function increment(x) {
      return x + 1;
    }
    var input = 3;
    var p1 = Parsimmon.of(input).ap(Parsimmon.of(increment));
    var p2 = Parsimmon.of(increment).ap(
      Parsimmon.of(function(f) {
        return f(input);
      })
    );
    assert.deepEqual(p1.parse(""), p2.parse(""));
  });
});
