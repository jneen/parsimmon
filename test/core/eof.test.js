"use strict";

test("eof", function() {
  var parser = Parsimmon.optWhitespace
    .skip(Parsimmon.eof)
    .or(Parsimmon.all.result("default"));

  assert.equal(parser.parse("  ").value, "  ");
  assert.equal(parser.parse("x").value, "default");
});
