"use strict";

it("test", function() {
  var parser = Parsimmon.test(function(ch) {
    return ch !== ".";
  });
  assert.equal(parser.parse("x").value, "x");
  assert.equal(parser.parse(".").status, false);
  assert.throws(function() {
    Parsimmon.test("not a function");
  });
});
