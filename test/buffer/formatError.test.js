"use strict";

function fill(length, filler) {
  var res = [];
  for (var i = 0; i < length; i++) {
    res.push(filler);
  }
  return res;
}

describe("formatError", function() {
  it("byte buffer error at the end of the short input", function() {
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

  it("byte buffer error with a value one character long", function() {
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

  it("byte buffer error with multi-line input", function() {
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

  it("byte buffer error at the first line of the multi-line input", function() {
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

  it("byte buffer error at the end of the multi-line input", function() {
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

  it("parsing error in a large byte buffer", function() {
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

  it("error marker is padded with correctly in an error on a fourth byte", function() {
    var parser = Parsimmon.seq(
      Parsimmon.Binary.byte(0x01),
      Parsimmon.Binary.byte(0x00),
      Parsimmon.Binary.byte(0x00),
      Parsimmon.Binary.byte(0x02),
      Parsimmon.Binary.byte(0x01)
    );

    var expectation =
      "\n" +
      "-- PARSING FAILED --------------------------------------------------\n" +
      "\n" +
      "> 00 | 01 00 00 03  00\n" +
      "     |          ^^\n" +
      "\n" +
      "Expected:\n" +
      "\n" +
      "0x02" +
      "\n";

    var input = Buffer.from([0x01, 0x00, 0x00, 0x03, 0x00]);

    var answer = Parsimmon.formatError(input, parser.parse(input));

    assert.deepEqual(answer, expectation);
  });

  it("error marker is padded with correctly in an error on a fifth byte", function() {
    var parser = Parsimmon.seq(
      Parsimmon.Binary.byte(0x01),
      Parsimmon.Binary.byte(0x00),
      Parsimmon.Binary.byte(0x00),
      Parsimmon.Binary.byte(0x02),
      Parsimmon.Binary.byte(0x01)
    );

    var expectation =
      "\n" +
      "-- PARSING FAILED --------------------------------------------------\n" +
      "\n" +
      "> 00 | 01 00 00 02  00\n" +
      "     |              ^^\n" +
      "\n" +
      "Expected:\n" +
      "\n" +
      "0x01" +
      "\n";

    var input = Buffer.from([0x01, 0x00, 0x00, 0x02, 0x00]);

    var answer = Parsimmon.formatError(input, parser.parse(input));

    assert.deepEqual(answer, expectation);
  });
});
