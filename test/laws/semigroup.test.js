/* global equivalentParsers */

"use strict";

describe("Fantasy Land Semigroup", function() {
  it("associativity", function() {
    var a = Parsimmon.string("a");
    var b = Parsimmon.string("b");
    var c = Parsimmon.string("c");
    var abc1 = a.concat(b).concat(c);
    var abc2 = a.concat(b.concat(c));
    equivalentParsers(abc1, abc2, ["abc", "ac"]);
  });
});
