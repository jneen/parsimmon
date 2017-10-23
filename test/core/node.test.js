"use strict";

test(".node(name)", function() {
  var ys = Parsimmon.regexp(/^y*/).node("Y");
  var parser = ys.trim(Parsimmon.optWhitespace);
  assert.deepEqual(parser.parse("").value, {
    name: "Y",
    value: "",
    start: { offset: 0, line: 1, column: 1 },
    end: { offset: 0, line: 1, column: 1 }
  });
  assert.deepEqual(parser.parse(" yy ").value, {
    name: "Y",
    value: "yy",
    start: { offset: 1, line: 1, column: 2 },
    end: { offset: 3, line: 1, column: 4 }
  });
  assert.deepEqual(parser.parse("\nyy ").value, {
    name: "Y",
    value: "yy",
    start: { offset: 1, line: 2, column: 1 },
    end: { offset: 3, line: 2, column: 3 }
  });
});
