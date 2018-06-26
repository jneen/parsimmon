"use strict";

describe("encodedString", function() {
  it("treats a sublength of a buffer as a string", function() {
    var b = Buffer.from("hello world", "ascii");
    var p = Parsimmon.Binary.encodedString("ascii", 11);
    assert.deepEqual(p.tryParse(b), "hello world");
  });

  context("utf8", function() {
    it("treats a sublength of a buffer as a string", function() {
      var b = Buffer.from("✓ “this test works!”", "utf8");
      var p = Parsimmon.Binary.encodedString("utf8", 26);
      assert.deepEqual(p.tryParse(b), "✓ “this test works!”");
    });

    it("treats a sublength of a buffer as a string", function() {
      var b = Buffer.from("hello🔥world", "utf8");
      var p = Parsimmon.Binary.encodedString("utf8", 14);
      assert.deepEqual(p.tryParse(b), "hello🔥world");
    });
  });

  context("utf16le", function() {
    it("treats a sublength of a buffer as a string", function() {
      var b = Buffer.from([0xac, 0x20, 0xac, 0x20, 0xac, 0x20]);
      var p = Parsimmon.Binary.encodedString("utf16le", 6);
      assert.deepEqual(p.tryParse(b), "€€€");
    });
  });

  context("latin1", function() {
    it("treats a sublength of a buffer as a string", function() {
      var b = Buffer.from([0xd2, 0x5f, 0xd3]);
      var p = Parsimmon.Binary.encodedString("latin1", 3);
      assert.deepEqual(p.tryParse(b), "Ò_Ó");
    });
  });
});
