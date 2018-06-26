"use strict";

describe("floatLE", function() {
  it("reads a float, little-endian", function() {
    var b = Buffer.from([1, 2, 3, 4]);
    var p = Parsimmon.Binary.floatLE;
    assert.deepEqual(p.tryParse(b), 1.539989614439558e-36);
  });
});
