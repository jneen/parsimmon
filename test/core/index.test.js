"use strict";

it("index", function() {
  var parser = Parsimmon.regexp(/^[x\n]*/).then(Parsimmon.index);
  assert.deepEqual(parser.parse("").value, {
    offset: 0,
    line: 1,
    column: 1
  });
  assert.deepEqual(parser.parse("xx").value, {
    offset: 2,
    line: 1,
    column: 3
  });
  assert.deepEqual(parser.parse("xx\nxx").value, {
    offset: 5,
    line: 2,
    column: 3
  });
});
