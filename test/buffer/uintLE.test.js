"use strict";

describe("uintLE family", function() {
  context("uintLE", function() {
    it("reads an int, unsigned, little-endian of specific length", function() {
      var b = Buffer.from([0xef, 0xbe]);
      var p = Parsimmon.Binary.uintLE(2);
      assert.deepEqual(p.tryParse(b), 0xbeef);
    });

    it("disallows bad lengths", function() {
      assert.throws(function() {
        return Parsimmon.Binary.uintLE(-1);
      });

      assert.throws(function() {
        return Parsimmon.Binary.uintLE(7);
      });
    });
  });

  context("uint16LE", function() {
    it("reads an int, unsigned, little-endian of 2 bytes", function() {
      var b = Buffer.from([0xef, 0xbe]);
      var p = Parsimmon.Binary.uint16LE;
      assert.deepEqual(p.tryParse(b), 0xbeef);
    });
  });

  context("uint32LE", function() {
    it("reads an int, unsigned, little-endian of 4 bytes", function() {
      var b = Buffer.from([0xef, 0xbe, 0xad, 0xde]);
      var p = Parsimmon.Binary.uint32LE;
      assert.deepEqual(p.tryParse(b), 0xdeadbeef);
    });
  });
});
