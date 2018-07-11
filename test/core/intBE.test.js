"use strict";

describe("intBE family", function() {
  context("intBE", function() {
    it("reads an int, unsigned, big-endian of specific length", function() {
      var b = Buffer.from([0xff, 0xff]);
      var p = Parsimmon.Binary.intBE(2);
      assert.deepEqual(p.tryParse(b), -1);
    });

    it("disallows bad lengths", function() {
      assert.throws(function() {
        return Parsimmon.Binary.intBE(-1);
      });

      assert.throws(function() {
        return Parsimmon.Binary.intBE(7);
      });
    });
  });

  context("int8", function() {
    it("reads an int, signed of 1 byte", function() {
      var b = Buffer.from([0xff, 0xff]);
      var p = Parsimmon.Binary.int8BE.skip(Parsimmon.any);
      assert.deepEqual(p.tryParse(b), -1);
    });
  });

  context("int16BE", function() {
    it("reads an int, signed, big-endian of 2 bytes", function() {
      var b = Buffer.from([0xff, 0xff]);
      var p = Parsimmon.Binary.int16BE;
      assert.deepEqual(p.tryParse(b), -1);
    });
  });

  context("int32BE", function() {
    it("reads an int, signed, big-endian of 4 bytes", function() {
      var b = Buffer.from([0xff, 0xff, 0xff, 0xff]);
      var p = Parsimmon.Binary.int32BE;
      assert.deepEqual(p.tryParse(b), -1);
    });
  });
});
