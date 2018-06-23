"use strict";

function fill(length, filler) {
  var res = [];
  for (var i = 0; i < length; i++) {
    res.push(filler);
  }
  return res;
}

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

  test("byte buffer error at the end of the short input", function() {
    var parser = Parsimmon.seq(
      Parsimmon.Binary.byte(0x00).many(),
      Parsimmon.Binary.byte(0x01)
    );

    var expectation =
      "\n" +
      "-- PARSING FAILED --------------------------------------------------\n" +
      "\n" +
      "> 00 | 00 02\n" +
      "     |    ^^\n" +
      "\n" +
      "Expected one of the following: \n" +
      "\n" +
      "0x00, 0x01" +
      "\n";

    var input = Buffer.from([0x0, 0x02]);
    var answer = Parsimmon.formatError(input, parser.parse(input));

    assert.deepEqual(answer, expectation);
  });

  test("byte buffer error with a value one character long", function() {
    var parser = Parsimmon.seq(Parsimmon.Binary.byte(0x1));

    var expectation =
      "\n" +
      "-- PARSING FAILED --------------------------------------------------\n" +
      "\n" +
      "> 00 | 02\n" +
      "     | ^^\n" +
      "\n" +
      "Expected:\n" +
      "\n" +
      "0x01" +
      "\n";

    var input = Buffer.from([0x2]);
    var answer = Parsimmon.formatError(input, parser.parse(input));

    assert.deepEqual(answer, expectation);
  });

  test("byte buffer error with multi-line input", function() {
    var parser = Parsimmon.seq(
      Parsimmon.Binary.byte(0x00).many(),
      Parsimmon.Binary.byte(0x01)
    );

    var expectation =
      "\n" +
      "-- PARSING FAILED --------------------------------------------------\n" +
      "\n" +
      "  10 | 00 00 00 00  00 00 00 00\n" +
      "  18 | 00 00 00 00  00 00 00 00\n" +
      "  20 | 00 00 00 00  00 00 00 00\n" +
      "  28 | 00 00 00 00  00 00 00 00\n" +
      "  30 | 00 00 00 00  00 00 00 00\n" +
      "> 38 | 00 00 ff 00  00 00 00 00\n" +
      "     |       ^^\n" +
      "  40 | 00 00 00 00  00 00 00 00\n" +
      "  48 | 00 00 00 00  00 00 00 00\n" +
      "  50 | 00 00 00 00  00 00 00 00\n" +
      "  58 | 00 00 00 00  00 00 00 00\n" +
      "\n" +
      "Expected one of the following: \n" +
      "\n" +
      "0x00, 0x01" +
      "\n";

    var input = Buffer.from(
      [].concat(
        [0x0, 0x0, 0x00, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x00, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x00, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x00, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x00, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x00, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x00, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0xff, 0x0, 0x0, 0x0, 0x0, 0x0], // <- Error
        [0x0, 0x0, 0x00, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x00, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x00, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x00, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x00, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x00, 0x0, 0x0, 0x0, 0x0, 0x0],
        [0x0, 0x0, 0x00, 0x0, 0x0, 0x0, 0x0, 0x0]
      )
    );

    var answer = Parsimmon.formatError(input, parser.parse(input));

    assert.deepEqual(answer, expectation);
  });

  test("byte buffer error at the first line of the multi-line input", function() {
    var parser = Parsimmon.seq(
      Parsimmon.Binary.byte(0x00).many(),
      Parsimmon.Binary.byte(0x01)
    );

    var expectation =
      "\n" +
      "-- PARSING FAILED --------------------------------------------------\n" +
      "\n" +
      "> 00 | 00 00 ff 00  00 00 00 00\n" +
      "     |       ^^\n" +
      "  08 | 00 00 00 00\n" +
      "\n" +
      "Expected one of the following: \n" +
      "\n" +
      "0x00, 0x01" +
      "\n";

    var input = Buffer.from(
      [].concat([0x0, 0x0, 0xff, 0x0, 0x0, 0x0, 0x0, 0x0], [0x0, 0x0, 0x0, 0x0])
    );

    var answer = Parsimmon.formatError(input, parser.parse(input));

    assert.deepEqual(answer, expectation);
  });

  test("byte buffer error at the end of the multi-line input", function() {
    var parser = Parsimmon.seq(
      Parsimmon.Binary.byte(0x00).many(),
      Parsimmon.Binary.byte(0x01)
    );

    var expectation =
      "\n" +
      "-- PARSING FAILED --------------------------------------------------\n" +
      "\n" +
      "  20 | 00 00 00 00  00 00 00 00\n" +
      "  28 | 00 00 00 00  00 00 00 00\n" +
      "  30 | 00 00 00 00  00 00 00 00\n" +
      "  38 | 00 00 00 00  00 00 00 00\n" +
      "  40 | 00 00 00 00  00 00 00 00\n" +
      "> 48 | 00 00 00 00  00 00 00 ff\n" +
      "     |                       ^^\n" +
      "\n" +
      "Expected one of the following: \n" +
      "\n" +
      "0x00, 0x01" +
      "\n";

    // 90 bytes
    var input = Buffer.from(
      [].concat(
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x00],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x00],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x00],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x00],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x00],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x00],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x00],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x00],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x00],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xff] // <- Error
      )
    );

    var answer = Parsimmon.formatError(input, parser.parse(input));

    assert.deepEqual(answer, expectation);
  });

  test("parsing error in a large byte buffer", function() {
    var parser = Parsimmon.seq(
      Parsimmon.Binary.byte(0x00).many(),
      Parsimmon.Binary.byte(0x01)
    );

    var expectation =
      "\n" +
      "-- PARSING FAILED --------------------------------------------------\n" +
      "\n" +
      "  0fd0 | 00 00 00 00  00 00 00 00\n" +
      "  0fd8 | 00 00 00 00  00 00 00 00\n" +
      "  0fe0 | 00 00 00 00  00 00 00 00\n" +
      "  0fe8 | 00 00 00 00  00 00 00 00\n" +
      "  0ff0 | 00 00 00 00  00 00 00 00\n" +
      "> 0ff8 | 00 00 00 00  00 00 00 ff\n" +
      "       |                       ^^\n" +
      "  1000 | 00 00 00 00  00 00 00 00\n" +
      "  1008 | 00 00 00 00  00 00 00 00\n" +
      "  1010 | 00 00 00 00  00 00 00 00\n" +
      "  1018 | 00 00 00 00  00 00 00 00\n" +
      "\n" +
      "Expected one of the following: \n" +
      "\n" +
      "0x00, 0x01" +
      "\n";

    var list = fill(8 * 511, 0x0);

    var input = Buffer.from(
      [].concat(
        list,
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xff], // <- Error
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x00],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x00],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x00],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x00],
        [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x00]
      )
    );

    var answer = Parsimmon.formatError(input, parser.parse(input));

    assert.deepEqual(answer, expectation);
  });
});
