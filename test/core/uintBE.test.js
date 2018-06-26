"use strict";

describe("uintBE family", function() {
  context("uintBE", function() {
    it("reads an int, unsigned, big-endian of specific length", function() {
      var b = Buffer.from([0xbe, 0xef]);
      var p = Parsimmon.Binary.uintBE(2);
      assert.deepEqual(p.tryParse(b), 0xbeef);
    });

    it("disallows bad lengths", function() {
      assert.throws(function() {
        return Parsimmon.Binary.uintBE(-1);
      });

      assert.throws(function() {
        return Parsimmon.Binary.uintBE(7);
      });
    });
  });

  context("uint8", function() {
    it("reads an int, unsigned of 1 byte", function() {
      var b = Buffer.from([0xff, 0xff]);
      var p = Parsimmon.Binary.uint8BE.skip(Parsimmon.any);
      assert.deepEqual(p.tryParse(b), 0xff);
    });
  });

  context("uint16BE", function() {
    it("reads an int, unsigned, big-endian of 2 bytes", function() {
      var b = Buffer.from([0xbe, 0xef]);
      var p = Parsimmon.Binary.uint16BE;
      assert.deepEqual(p.tryParse(b), 0xbeef);
    });
  });

  context("uint32BE", function() {
    it("reads an int, unsigned, big-endian of 4 bytes", function() {
      var b = Buffer.from([0xde, 0xad, 0xbe, 0xef]);
      var p = Parsimmon.Binary.uint32BE;
      assert.deepEqual(p.tryParse(b), 0xdeadbeef);
    });
  });
});
