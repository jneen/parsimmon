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

it("multiple index", function() {
  var parser = Parsimmon.seqMap(
    Parsimmon.index,
    Parsimmon.string("a\nb"),
    Parsimmon.index,
    function(i1, s, i2) {
      return { index1: i1, str: s, index2: i2 };
    }
  );

  assert.deepEqual(parser.parse("a\nb").value, {
    index1: {
      column: 1,
      line: 1,
      offset: 0
    },
    index2: {
      column: 2,
      line: 2,
      offset: 3
    },
    str: "a\nb"
  });
});
