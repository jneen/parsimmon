"use strict";

describe("intLE family", function() {
  context("intLE", function() {
    it("reads an int, unsigned, big-endian of specific length", function() {
      var b = Buffer.from([0xfe, 0xff]);
      var p = Parsimmon.Binary.intLE(2);
      assert.deepEqual(p.tryParse(b), -2);
    });

    it("disallows bad lengths", function() {
      assert.throws(function() {
        return Parsimmon.Binary.intLE(-1);
      });

      assert.throws(function() {
        return Parsimmon.Binary.intLE(7);
      });
    });
  });

  context("int8", function() {
    it("reads an int, signed of 1 byte", function() {
      var b = Buffer.from([0xfe, 0xff]);
      var p = Parsimmon.Binary.int8LE.skip(Parsimmon.any);
      assert.deepEqual(p.tryParse(b), -2);
    });
  });

  context("int16BE", function() {
    it("reads an int, signed, big-endian of 2 bytes", function() {
      var b = Buffer.from([0xfd, 0xff]);
      var p = Parsimmon.Binary.int16LE;
      assert.deepEqual(p.tryParse(b), -3);
    });
  });

  context("int32BE", function() {
    it("reads an int, signed, big-endian of 4 bytes", function() {
      var b = Buffer.from([0xfc, 0xff, 0xff, 0xff]);
      var p = Parsimmon.Binary.int32LE;
      assert.deepEqual(p.tryParse(b), -4);
    });
  });
});
