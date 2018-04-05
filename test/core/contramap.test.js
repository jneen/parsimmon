"use strict";

suite("map", function() {
  test("with a function, transforms the input and parses that", function() {
    var parser = Parsimmon.string("x").contramap(function(x) {
      return x.toLowerCase();
    });
    assert.deepEqual(parser.parse("X"), { status: true, value: "x" });
  });

  test("asserts that a function was given", function() {
    assert.throws(function() {
      Parsimmon.string("x").contramap("not a function");
    });
  });
});
