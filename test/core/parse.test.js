"use strict";

describe(".parse", function() {
  it("Unique and sorted .expected array", function() {
    var parser = Parsimmon.alt(
      Parsimmon.fail("c"),
      Parsimmon.fail("a"),
      Parsimmon.fail("a"),
      Parsimmon.fail("b"),
      Parsimmon.fail("b"),
      Parsimmon.fail("b"),
      Parsimmon.fail("a")
    );
    var result = parser.parse("");
    assert.deepEqual(result.expected, ["a", "b", "c"]);
  });

  it("throws when given a non-string argument", function() {
    assert.throws(function() {
      Parsimmon.of("kaboom").parse(0);
    });
    assert.throws(function() {
      Parsimmon.of("kaboom").parse();
    });
  });

  context("The input is a buffer.", function() {
    it("Formats errors correctly.", function() {
      var parser = Parsimmon.Binary.byte(0);
      assert.throws(function() {
        parser.tryParse(Buffer.from([0xf]));
      }, /0x00/);
    });
  });
});
