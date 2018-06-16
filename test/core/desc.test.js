"use strict";

suite("desc", function() {
  test("allows custom error messages", function() {
    var x = Parsimmon.string("x").desc("the letter x");
    var y = Parsimmon.string("y").desc("the letter y");
    var parser = x.then(y);

    assert.deepEqual(parser.parse("a"), {
      status: false,
      index: {
        offset: 0,
        line: 1,
        column: 1
      },
      expected: ["the letter x"]
    });

    assert.deepEqual(parser.parse("xa"), {
      status: false,
      index: {
        offset: 1,
        line: 1,
        column: 2
      },
      expected: ["the letter y"]
    });
  });

  test("allows tagging with `lazy`", function() {
    var x = Parsimmon.lazy("the letter x", function() {
      return Parsimmon.string("x");
    });
    var y = Parsimmon.lazy("the letter y", function() {
      return Parsimmon.string("y");
    });
    var parser = x.then(y);

    assert.deepEqual(parser.parse("a"), {
      status: false,
      index: {
        offset: 0,
        line: 1,
        column: 1
      },
      expected: ["the letter x"]
    });

    assert.deepEqual(parser.parse("xa"), {
      status: false,
      index: {
        offset: 1,
        line: 1,
        column: 2
      },
      expected: ["the letter y"]
    });
  });

  test("allows multiple descriptions to be passed as an array", function() {
    var x = Parsimmon.oneOf("xyz")
      .desc(["x", "y", "z"])
      .atLeast(1);
    var y = Parsimmon.oneOf("abc").desc(["a", "b", "c"]);

    var parser = x.then(y);

    assert.deepEqual(parser.parse("~"), {
      status: false,
      index: {
        offset: 0,
        line: 1,
        column: 1
      },
      expected: ["x", "y", "z"]
    });

    assert.deepEqual(parser.parse("x"), {
      status: false,
      index: {
        offset: 1,
        line: 1,
        column: 2
      },
      expected: ["a", "b", "c", "x", "y", "z"]
    });
  });
});
