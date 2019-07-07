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
