"use strict";

describe("buffer", function() {
  it("accepts a sublength of a buffer", function() {
    var b = Buffer.from([0xf, 0xf, 0xf, 0xf]);
    var p = Parsimmon.Binary.buffer(3).skip(Parsimmon.any);
    assert.deepEqual(p.tryParse(b), Buffer.from([0xf, 0xf, 0xf]));
  });

  it("fails if not enough buffer", function() {
    var b = Buffer.from([0xf, 0xf]);
    var p = Parsimmon.Binary.buffer(3);
    assert.throws(function() {
      p.tryParse(b);
    });
  });
});
