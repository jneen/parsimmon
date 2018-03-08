"use strict";

suite("bitSeqObj", function() {
  test("it consumes bits into an object from a buffer", function() {
    var b = Buffer.from([0xff, 0xff]);
    var p = Parsimmon.buffers.bitSeqObj([
      ["a", 3],
      ["b", 5],
      ["c", 5],
      ["d", 3]
    ]);
    assert.deepEqual(p.parse(b).value, { a: 7, b: 31, c: 31, d: 7 });
  });

  test("it disallows construction of parsers that don't align to byte boundaries", function() {
    assert.throws(function() {
      Parsimmon.buffers.bitSeqObj([["a", 1], ["b", 2]]);
    });
  });

  test("fails if requesting too much", function() {
    var b = Buffer.from([]);
    var p = Parsimmon.buffers.bitSeqObj([
      ["a", 3],
      ["b", 5],
      ["c", 5],
      ["d", 3]
    ]);
    assert.deepEqual(p.parse(b).expected, ["2 bytes"]);
  });

  test("it ignores unnamed ranges", function() {
    var b = Buffer.from([0xff, 0xff]);
    var p = Parsimmon.buffers.bitSeqObj([["a", 3], 5, ["c", 5], ["d", 3]]);
    assert.deepEqual(p.parse(b).value, { a: 7, c: 31, d: 7 });
  });
});
