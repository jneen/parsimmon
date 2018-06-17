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

  test("milti-line input", function() {
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

  test("multi-line line-number padding", function() {
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

  test("multi-line line-number with 3-digits", function() {
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

  test("multi-line line-number with 3-digit to 4-digit line numbers", function() {
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

  test("byte buffer error with multi-line input", function() {
    var parser = Parsimmon.seq(
      Parsimmon.Binary.byte(0x00).many(),
      Parsimmon.Binary.byte(0x01),
      Parsimmon.Binary.byte(0x00).many()
    );

    var expectation =
      "\n" +
      "-- PARSING FAILED --------------------------------------------------\n" +
      "\n" +
      "   2 | 0 0  0 0 0 0 0 0 0 0\n" +
      "   3 | 0 0  0 0 0 0 0 0 0 0\n" +
      "   4 | 0 0  0 0 0 0 0 0 0 0\n" +
      "   5 | 0 0  0 0 0 0 0 0 0 0\n" +
      "   6 | 0 0  0 0 0 0 0 0 0 0\n" +
      ">  7 | 0 0 ff 0 0 0 0 0 0 0\n" +
      "     |     ^^\n" +
      "   8 | 0 0  0 0 0 0 0 0 0 0\n" +
      "   9 | 0 0  0 0 0 0 0 0 0 0\n" +
      "  10 | 0 0  0 0 0 0 0 0 0 0\n" +
      "  11 | 0 0  0 0 0 0 0 0 0 0\n" +
      "\n" +
      "Expected one of the following: \n" +
      "\n" +
      "0x00, 0x01" +
      "\n";

    var input = Buffer.from(
      [].concat(
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0xffff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0], // index: 7
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]
      )
    );

    var answer = Parsimmon.formatError(input, parser.parse(input));

    assert.deepEqual(answer, expectation);
  });
});
