"use strict";

test(".empty()", function() {
  var emptyParse = {
    status: false,
    expected: ["fantasy-land/empty"],
    index: { offset: 0, line: 1, column: 1 }
  };
  assert.ok(Parsimmon.digit.empty);
  assert.ok(Parsimmon.empty);
  assert.deepEqual(Parsimmon.empty().parse(""), emptyParse);
});
