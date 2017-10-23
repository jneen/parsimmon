"use strict";

suite(".then", function() {
  test("with a parser, uses the last return value", function() {
    var parser = Parsimmon.string("x").then(Parsimmon.string("y"));
    assert.deepEqual(parser.parse("xy"), { status: true, value: "y" });
    assert.deepEqual(parser.parse("y"), {
      status: false,
      expected: ["'x'"],
      index: {
        offset: 0,
        line: 1,
        column: 1
      }
    });
    assert.deepEqual(parser.parse("xz"), {
      status: false,
      expected: ["'y'"],
      index: {
        offset: 1,
        line: 1,
        column: 2
      }
    });
  });

  test("errors when argument is not a parser", function() {
    assert.throws(function() {
      Parsimmon.string("x").then("not a parser");
    });
  });
});
