"use strict";

describe("bitSeq", function() {
  it("consumes bits into a sequence from a buffer", function() {
    var b = Buffer.from([0xff, 0xff]);
    var p = Parsimmon.Binary.bitSeq([3, 5, 5, 3]);
    assert.deepEqual(p.parse(b).value, [7, 31, 31, 7]);
  });

  it("disallows construction of parsers that don't align to byte boundaries", function() {
    assert.throws(function() {
      Parsimmon.Binary.bitSeq([1, 2]);
    });
  });

  it("fails if requesting too much", function() {
    var b = Buffer.from([]);
    var p = Parsimmon.Binary.bitSeq([3, 5, 5, 3]);
    assert.deepEqual(p.parse(b).expected, ["2 bytes"]);
  });

  it("throws an exception for too large of a range request", function() {
    assert.throws(function() {
      Parsimmon.Binary.bitSeq([1, 2, 4, 49]);
    });
  });

  context("Buffer is not present.", function() {
    var buff;
    before(function() {
      buff = global.Buffer;
      global.Buffer = undefined;
    });

    after(function() {
      global.Buffer = buff;
    });

    it("Disallows construction.", function() {
      assert.throws(function() {
        Parsimmon.Binary.bitSeq(0xf);
      }, /buffer global/i);
    });
  });
});
