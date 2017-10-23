"use strict";

var H = require("../helpers");

suite("Fantasy Land Apply", function() {
  test("composition", function() {
    function reverse(s) {
      return s
        .split("")
        .reverse()
        .join("");
    }

    function upperCase(s) {
      return s.toUpperCase();
    }

    function compose(f) {
      return function(g) {
        return function(x) {
          return f(g(x));
        };
      };
    }

    var p1 = Parsimmon.all
      .ap(Parsimmon.of(reverse))
      .ap(Parsimmon.of(upperCase));

    var p2 = Parsimmon.all.ap(
      Parsimmon.of(reverse).ap(Parsimmon.of(upperCase).map(compose))
    );

    H.equivalentParsers(p1, p2, ["ok cool"]);
  });
});
