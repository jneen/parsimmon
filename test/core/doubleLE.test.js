"use strict";

describe("doubleLE", function() {
  it("reads a double, big-endian", function() {
    var b = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]);
    var p = Parsimmon.Binary.doubleLE;
    assert.deepEqual(p.tryParse(b), 5.447603722011605e-270);
  });
});
