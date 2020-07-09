"use strict";

testSetScenario(function() {
  describe("chain", function() {
    it("asserts that a parser is returned", function() {
      var parser1 = Parsimmon.letter.chain(function() {
        return "not a parser";
      });
      assert.throws(function() {
        parser1.parse("x");
      });

      assert.throws(function() {
        Parsimmon.letter.then("x");
      });
    });

    it("with a function that returns a parser, continues with that parser", function() {
      var piped;
      var parser = Parsimmon.string("x").chain(function(x) {
        piped = x;
        return Parsimmon.string("y");
      });

      assert.deepEqual(parser.parse("xy"), { status: true, value: "y" });
      assert.equal(piped, "x");
      assert.ok(!parser.parse("x").status);
    });
  });
});
