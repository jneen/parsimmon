"use strict";

describe("floatBE", function() {
  it("reads a float, big-endian", function() {
    var b = Buffer.from([1, 2, 3, 4]);
    var p = Parsimmon.Binary.floatBE;
    assert.deepEqual(p.tryParse(b), 2.387939260590663e-38);
  });
});
