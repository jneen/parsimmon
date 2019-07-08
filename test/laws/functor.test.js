/* global equivalentParsers */

"use strict";

describe("Fantasy Land Functor", function() {
  it("identity", function() {
    var p1 = Parsimmon.digits;
    var p2 = Parsimmon.digits.map(function(x) {
      return x;
    });
    equivalentParsers(p1, p2, ["091", "111111", "46782792", "oops"]);
  });

  it("composition", function() {
    function increment(x) {
      return x + 1;
    }
    var p1 = Parsimmon.digits.map(function(x) {
      return increment(Number(x));
    });
    var p2 = Parsimmon.digits.map(Number).map(increment);
    equivalentParsers(p1, p2, [
      "12",
      "98789",
      "89772371298389217387128937979839821738",
      "oh no!"
    ]);
  });
});
