"use strict";

describe("doubleBE", function() {
  it("reads a double, big-endian", function() {
    var b = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]);
    var p = Parsimmon.Binary.doubleBE;
    assert.deepEqual(p.tryParse(b), 8.20788039913184e-304);
  });
});
