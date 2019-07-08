"use strict";

describe("formatError", function() {
  it("end of input", function() {
    var parser = Parsimmon.alt(
      Parsimmon.fail("a"),
      Parsimmon.fail("b"),
      Parsimmon.fail("c")
    );
    var expectation =
      "\n" +
      "-- PARSING FAILED --------------------------------------------------\n" +
      "\n" +
      "Got the end of the input\n" +
      "\n" +
      "Expected one of the following: \n" +
      "\n" +
      "a, b, c\n";
    var input = "";
    var answer = Parsimmon.formatError(input, parser.parse(input));
    assert.deepEqual(answer, expectation);
  });

  it("middle of input", function() {
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
      "-- PARSING FAILED --------------------------------------------------\n" +
      "\n" +
      "> 1 | 1x1111111111111111111111111111\n" +
      "    |  ^\n\n" +
      "Expected one of the following: \n" +
      "\n" +
      "a, b, c\n";
    var input = "1x1111111111111111111111111111";
    var answer = Parsimmon.formatError(input, parser.parse(input));
    assert.deepEqual(answer, expectation);
  });

  it("milti-line input", function() {
    var parser = Parsimmon.seq(
      Parsimmon.string("\n")
        .many()
        .then(Parsimmon.string("a"))
    );
    var expectation =
      "\n" +
      "-- PARSING FAILED --------------------------------------------------\n" +
      "\n" +
      "  1 | \n" +
      "  2 | \n" +
      "> 3 | b\n" +
      "    | ^\n" +
      "  4 | \n" +
      "  5 | \n" +
      "\n" +
      "Expected one of the following: \n" +
      "\n" +
      "'\n', 'a'\n";
    var input = "\n\nb\n\n\n";
    var answer = Parsimmon.formatError(input, parser.parse(input));
    assert.deepEqual(answer, expectation);
  });

  it("multi-line line-number padding", function() {
    var parser = Parsimmon.seq(
      Parsimmon.string("\n")
        .many()
        .then(Parsimmon.string("a"))
    );
    var expectation =
      "\n" +
      "-- PARSING FAILED --------------------------------------------------\n" +
      "\n" +
      "   8 | \n" +
      "   9 | \n" +
      "> 10 | b\n" +
      "     | ^\n" +
      "\n" +
      "Expected one of the following: \n" +
      "\n" +
      "'\n', 'a'\n";

    var input = new Array(9).join("\n") + "\nb";
    var answer = Parsimmon.formatError(input, parser.parse(input));

    assert.deepEqual(answer, expectation);
  });

  it("multi-line line-number with 3-digits", function() {
    var parser = Parsimmon.seq(
      Parsimmon.string("\n")
        .many()
        .then(Parsimmon.string("b"))
    );
    var expectation =
      "\n" +
      "-- PARSING FAILED --------------------------------------------------\n\n" +
      "  116 | \n" +
      "  117 | \n" +
      "> 118 | c\n" +
      "      | ^\n" +
      "  119 | \n" +
      "  120 | \n" +
      "\n" +
      "Expected one of the following: \n" +
      "\n" +
      "'\n', 'b'\n";

    var input = new Array(117).join("\n") + "\nc" + new Array(10).join("\n");
    var answer = Parsimmon.formatError(input, parser.parse(input));
    // console.log(answer);

    assert.deepEqual(answer, expectation);
  });

  it("multi-line line-number with 3-digit to 4-digit line numbers", function() {
    var parser = Parsimmon.seq(
      Parsimmon.string("\n")
        .many()
        .then(Parsimmon.string("c"))
    );
    var expectation =
      "\n" +
      "-- PARSING FAILED --------------------------------------------------\n\n" +
      "   998 | \n" +
      "   999 | \n" +
      "> 1000 | d\n" +
      "       | ^\n" +
      "  1001 | \n" +
      "  1002 | \n" +
      "\n" +
      "Expected one of the following: \n" +
      "\n" +
      "'\n', 'c'\n";

    var input = new Array(999).join("\n") + "\nd" + new Array(10).join("\n");
    var answer = Parsimmon.formatError(input, parser.parse(input));

    assert.deepEqual(answer, expectation);
  });
});
