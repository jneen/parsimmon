"use strict";

var H = require("../helpers");

suite("Fantasy Land Semigroup", function() {
  test("associativity", function() {
    var a = Parsimmon.string("a");
    var b = Parsimmon.string("b");
    var c = Parsimmon.string("c");
    var abc1 = a.concat(b).concat(c);
    var abc2 = a.concat(b.concat(c));
    H.equivalentParsers(abc1, abc2, ["abc", "ac"]);
  });
});
