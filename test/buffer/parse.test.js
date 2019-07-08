"use strict";

describe(".parse", function() {
  context("The input is a buffer.", function() {
    it("Formats errors correctly.", function() {
      var parser = Parsimmon.Binary.byte(0);
      assert.throws(function() {
        parser.tryParse(Buffer.from([0xf]));
      }, /0x00/);
    });
  });
});
