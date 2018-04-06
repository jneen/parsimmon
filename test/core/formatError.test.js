"use strict";

suite("formatError", function() {
  test("end of input", function() {
    var parser = Parsimmon.alt(
      Parsimmon.fail("a"),
      Parsimmon.fail("b"),
      Parsimmon.fail("c")
    );
    var expectation =
      "\n" +
      "-- PARSING FAILED --------------------------------------------------\n\n" +
      "Got the end of the input\n\n" +
      "Expected one of the following: \n\n" +
      "a, b, c\n";
    var input = "";
    var answer = Parsimmon.formatError(input, parser.parse(input));
    assert.deepEqual(answer, expectation);
  });

  test("middle of input", function() {
    var parser = Parsimmon.seq(
      Parsimmon.string("1"),
      Parsimmon.alt(
        Parsimmon.fail("a"),
        Parsimmon.fail("b"),
        Parsimmon.fail("c")
      )
    );
    var expectation =
      "\n" +
      "-- PARSING FAILED --------------------------------------------------\n\n" +
      "> 1 | 1x1111111111111111111111111111\n" +
      "    |  ^\n\n" +
      "Expected one of the following: \n\n" +
      "a, b, c\n";
    var input = "1x1111111111111111111111111111";
    var answer = Parsimmon.formatError(input, parser.parse(input));
    assert.deepEqual(answer, expectation);
  });
});
