"use strict";

suite(".parse", function() {
  test("Unique and sorted .expected array", function() {
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

  test("throws when given a non-string argument", function() {
    assert.throws(function() {
      Parsimmon.of("kaboom").parse(0);
    });
    assert.throws(function() {
      Parsimmon.of("kaboom").parse();
    });
  });
});
