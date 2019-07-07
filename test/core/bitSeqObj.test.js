"use strict";

describe("bitSeqObj", function() {
  it("consumes bits into an object from a buffer", function() {
    var b = Buffer.from([0xff, 0xff]);
    var p = Parsimmon.Binary.bitSeqObj([
      ["a", 3],
      ["b", 5],
      ["c", 5],
      ["d", 3]
    ]);
    assert.deepEqual(p.parse(b).value, { a: 7, b: 31, c: 31, d: 7 });
  });

  it("disallows construction of parsers that don't align to byte boundaries", function() {
    assert.throws(function() {
      Parsimmon.Binary.bitSeqObj([["a", 1], ["b", 2]]);
    });
  });

  it("throws when there are zero keys", function() {
    assert.throws(function() {
      Parsimmon.Binary.bitSeqObj([1, 7]);
    }, /expects at least one/i);
    assert.throws(function() {
      Parsimmon.Binary.bitSeqObj([1, 3, 2, 2]);
    }, /expects at least one/i);
  });

  it("throws when there are duplicate keys", function() {
    assert.throws(function() {
      Parsimmon.Binary.bitSeqObj([["a", 1], ["a", 7]]);
    }, /duplicate/i);
    assert.throws(function() {
      Parsimmon.Binary.bitSeqObj([["a", 1], ["b", 2], ["a", 5]]);
    }, /duplicate/i);
  });

  it("throws you pass the wrong type of argument", function() {
    assert.throws(function() {
      Parsimmon.Binary.bitSeqObj([[]]);
    }, /should be length 2/i);
    assert.throws(function() {
      Parsimmon.Binary.bitSeqObj([[1, 2, 3]]);
    }, /should be length 2/i);
    assert.throws(function() {
      Parsimmon.Binary.bitSeqObj([[1, 1]]);
    }, /not a string/i);
    assert.throws(function() {
      Parsimmon.Binary.bitSeqObj([["a", "a"]]);
    }, /not a number/i);
  });

  it("fails if requesting too much", function() {
    var b = Buffer.from([]);
    var p = Parsimmon.Binary.bitSeqObj([
      ["a", 3],
      ["b", 5],
      ["c", 5],
      ["d", 3]
    ]);
    assert.deepEqual(p.parse(b).expected, ["2 bytes"]);
  });

  it("ignores unnamed ranges", function() {
    var b = Buffer.from([0xff, 0xff]);
    var p = Parsimmon.Binary.bitSeqObj([["a", 3], 5, ["c", 5], ["d", 3]]);
    assert.deepEqual(p.parse(b).value, { a: 7, c: 31, d: 7 });
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
        Parsimmon.Binary.bitSeqObj(0xf);
      }, /buffer global/i);
    });
  });

  it("accepts 'constructor' as a key", function() {
    var b = Buffer.from([0xff]);
    var p = Parsimmon.Binary.bitSeqObj([["constructor", 8]]);
    assert.deepEqual(p.parse(b).value, { constructor: 255 });
  });
});
