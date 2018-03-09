"use strict";

suite("bitSeq", function() {
  test("it consumes bits into a sequence from a buffer", function() {
    var b = Buffer.from([0xff, 0xff]);
    var p = Parsimmon.Binary.bitSeq([3, 5, 5, 3]);
    assert.deepEqual(p.parse(b).value, [7, 31, 31, 7]);
  });

  test("it disallows construction of parsers that don't align to byte boundaries", function() {
    assert.throws(function() {
      Parsimmon.Binary.bitSeq([1, 2]);
    });
  });

  test("fails if requesting too much", function() {
    var b = Buffer.from([]);
    var p = Parsimmon.Binary.bitSeq([3, 5, 5, 3]);
    assert.deepEqual(p.parse(b).expected, ["2 bytes"]);
  });

  test("it throws an exception for too large of a range request", function() {
    assert.throws(function() {
      Parsimmon.Binary.bitSeq([1, 2, 4, 49]);
    });
  });
});
