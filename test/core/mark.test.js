"use strict";

it("mark", function() {
  var ys = Parsimmon.regexp(/^y*/).mark();
  var parser = Parsimmon.optWhitespace.then(ys).skip(Parsimmon.optWhitespace);
  assert.deepEqual(parser.parse("").value, {
    value: "",
    start: { offset: 0, line: 1, column: 1 },
    end: { offset: 0, line: 1, column: 1 }
  });
  assert.deepEqual(parser.parse(" yy ").value, {
    value: "yy",
    start: { offset: 1, line: 1, column: 2 },
    end: { offset: 3, line: 1, column: 4 }
  });
  assert.deepEqual(parser.parse("\nyy ").value, {
    value: "yy",
    start: { offset: 1, line: 2, column: 1 },
    end: { offset: 3, line: 2, column: 3 }
  });
});

it("should correctly report line number when parsing optional newlines", function() {
  var parser = Parsimmon.seq(
    Parsimmon.newline,
    Parsimmon.newline.many()
  ).mark();

  assert.deepEqual(parser.parse("\n").value, {
    start: {
      column: 0,
      line: 2,
      offset: 0
    },
    end: {
      column: 1,
      line: 2,
      offset: 1
    },
    value: ["\n", []]
  });
});
