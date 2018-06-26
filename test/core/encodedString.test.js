"use strict";

describe("encodedString", function() {
  it("treats a sublength of a buffer as a string", function() {
    var b = Buffer.from("hello world", "ascii");
    var p = Parsimmon.Binary.encodedString("ascii", 11);
    assert.deepEqual(p.tryParse(b), "hello world");
  });
});
